/**
 * TvManager — owns the single live connection to a TV plus the transient
 * pairing session, and exposes a small, promise-based API the routes call.
 *
 * Pairing (first time) is a two-step handshake:
 *   1. startPairing(host)  -> opens a connection; the TV shows a 6-digit code
 *      and the library emits `secret`.
 *   2. submitCode(code)    -> sends the code; on success the TV returns a
 *      certificate we persist so future connects skip pairing entirely.
 *
 * Reconnecting (subsequent runs) uses the saved certificate via connect().
 */
import { AndroidRemote, RemoteKeyCode, RemoteDirection } from "androidtv-remote";
import { config } from "../config.js";

const SERVICE_NAME = "Television Controller";
const PAIRING_PORT = 6467;
const REMOTE_PORT = 6466;

const SECRET_TIMEOUT = 15_000; // wait for the TV to display its pairing code
const READY_TIMEOUT = 15_000; // wait for the remote channel to come up

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

class TvManager {
  constructor() {
    /** @type {AndroidRemote|null} active, paired connection */
    this.remote = null;
    /** Live device state mirrored from the TV's events. */
    this.state = { host: null, name: null, powered: false, volume: null, currentApp: null };
    /** @type {{remote:AndroidRemote, host:string, name:string, startPromise:Promise}|null} */
    this.pairing = null;
  }

  isConnected() {
    return this.remote !== null;
  }

  getStatus() {
    return {
      connected: this.isConnected(),
      pairing: this.pairing !== null,
      ...this.state,
    };
  }

  /** Wire a paired AndroidRemote instance up as the active connection. */
  _activate(remote, host, name) {
    this.remote = remote;
    this.state = { host, name, powered: false, volume: null, currentApp: null };

    remote.on("powered", (powered) => {
      this.state.powered = powered;
    });
    remote.on("volume", (volume) => {
      this.state.volume = volume;
    });
    remote.on("current_app", (currentApp) => {
      this.state.currentApp = currentApp;
    });
    remote.on("unpaired", () => this._teardown());
    remote.on("close", () => this._teardown());
  }

  _teardown() {
    this.remote = null;
    this.state = { host: null, name: null, powered: false, volume: null, currentApp: null };
  }

  /**
   * Step 1 of pairing: connect and trigger the on-screen code.
   * Resolves once the TV has displayed its code.
   */
  async startPairing(host, name = "Android TV") {
    // Drop any half-open pairing session before starting a new one.
    if (this.pairing) {
      try {
        this.pairing.remote.stop();
      } catch {
        /* ignore */
      }
      this.pairing = null;
    }

    const remote = new AndroidRemote(host, {
      pairing_port: PAIRING_PORT,
      remote_port: REMOTE_PORT,
      service_name: SERVICE_NAME,
      cert: {}, // empty cert => generate a fresh one and start pairing
    });

    const gotSecret = new Promise((resolve, reject) => {
      remote.once("secret", resolve);
      remote.once("error", reject);
    });

    // start() resolves only once fully ready; keep the promise for step 2.
    const startPromise = remote.start();
    startPromise.catch(() => {});

    this.pairing = { remote, host, name, startPromise };

    await withTimeout(
      gotSecret,
      SECRET_TIMEOUT,
      "TV did not show a pairing code. Check the IP and that the TV is on."
    );

    return { status: "awaiting_code", host, name };
  }

  /**
   * Step 2 of pairing: submit the on-screen code. On success persists the
   * certificate and promotes the connection to active.
   */
  async submitCode(code) {
    if (!this.pairing) {
      throw new Error("No pairing in progress. Start pairing first.");
    }
    const { remote, host, name, startPromise } = this.pairing;

    remote.sendCode(code);

    // start() returns a truthy value once the remote channel is ready.
    const started = await withTimeout(
      startPromise,
      READY_TIMEOUT,
      "Pairing did not complete. The code may be wrong — please try again."
    );

    if (!started) {
      throw new Error("Pairing failed. The code may be wrong — please try again.");
    }

    const cert = remote.getCertificate();
    config.saveTv({ host, name, cert });

    this.pairing = null;
    this._activate(remote, host, name);

    return { host, name };
  }

  /** Connect using a previously saved certificate (no pairing needed). */
  async connect(host, name, cert) {
    if (this.remote) return this.getStatus();

    const remote = new AndroidRemote(host, {
      pairing_port: PAIRING_PORT,
      remote_port: REMOTE_PORT,
      service_name: SERVICE_NAME,
      cert,
    });

    const ready = new Promise((resolve, reject) => {
      remote.once("ready", resolve);
      remote.once("error", reject);
    });

    remote.start().catch(() => {});
    await withTimeout(ready, READY_TIMEOUT, "Could not connect to the saved TV.");

    this._activate(remote, host, name);
    return this.getStatus();
  }

  /** Reconnect to the TV stored in config, if any. */
  async connectSaved() {
    const tv = config.get("tv");
    if (!tv?.host || !tv?.cert?.cert) return null;
    return this.connect(tv.host, tv.name, tv.cert);
  }

  /** Disconnect and forget the paired TV. */
  unpair() {
    if (this.remote) {
      try {
        this.remote.stop();
      } catch {
        /* ignore */
      }
    }
    this._teardown();
    config.clearTv();
  }
}

export const tvManager = new TvManager();
export { RemoteKeyCode, RemoteDirection };
