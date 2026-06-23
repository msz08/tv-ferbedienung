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
import { EventEmitter } from "node:events";
import { AndroidRemote, RemoteKeyCode, RemoteDirection } from "androidtv-remote";
import { config } from "../config.js";

const SERVICE_NAME = "Television Controller";
const PAIRING_PORT = 6467;
const REMOTE_PORT = 6466;

/**
 * Friendly command names exposed to the UI, mapped to Android key codes.
 * The frontend sends semantic names (e.g. "dpad_up") rather than raw codes,
 * so only this vetted set of buttons can ever be triggered.
 */
const KEY_MAP = {
  // D-pad
  dpad_up: RemoteKeyCode.KEYCODE_DPAD_UP,
  dpad_down: RemoteKeyCode.KEYCODE_DPAD_DOWN,
  dpad_left: RemoteKeyCode.KEYCODE_DPAD_LEFT,
  dpad_right: RemoteKeyCode.KEYCODE_DPAD_RIGHT,
  select: RemoteKeyCode.KEYCODE_DPAD_CENTER,
  // Navigation
  home: RemoteKeyCode.KEYCODE_HOME,
  back: RemoteKeyCode.KEYCODE_BACK,
  menu: RemoteKeyCode.KEYCODE_MENU,
  settings: RemoteKeyCode.KEYCODE_SETTINGS,
  // Volume
  volume_up: RemoteKeyCode.KEYCODE_VOLUME_UP,
  volume_down: RemoteKeyCode.KEYCODE_VOLUME_DOWN,
  mute: RemoteKeyCode.KEYCODE_VOLUME_MUTE,
  // Media transport
  play_pause: RemoteKeyCode.KEYCODE_MEDIA_PLAY_PAUSE,
  stop: RemoteKeyCode.KEYCODE_MEDIA_STOP,
  next: RemoteKeyCode.KEYCODE_MEDIA_NEXT,
  previous: RemoteKeyCode.KEYCODE_MEDIA_PREVIOUS,
  rewind: RemoteKeyCode.KEYCODE_MEDIA_REWIND,
  fast_forward: RemoteKeyCode.KEYCODE_MEDIA_FAST_FORWARD,
  // Channels
  channel_up: RemoteKeyCode.KEYCODE_CHANNEL_UP,
  channel_down: RemoteKeyCode.KEYCODE_CHANNEL_DOWN,
  // Power (toggle)
  power: RemoteKeyCode.KEYCODE_POWER,
  // Digits (channel entry / number input)
  "0": RemoteKeyCode.KEYCODE_0,
  "1": RemoteKeyCode.KEYCODE_1,
  "2": RemoteKeyCode.KEYCODE_2,
  "3": RemoteKeyCode.KEYCODE_3,
  "4": RemoteKeyCode.KEYCODE_4,
  "5": RemoteKeyCode.KEYCODE_5,
  "6": RemoteKeyCode.KEYCODE_6,
  "7": RemoteKeyCode.KEYCODE_7,
  "8": RemoteKeyCode.KEYCODE_8,
  "9": RemoteKeyCode.KEYCODE_9,
  // Text editing
  space: RemoteKeyCode.KEYCODE_SPACE,
  delete: RemoteKeyCode.KEYCODE_DEL,
  enter: RemoteKeyCode.KEYCODE_ENTER,
  search: RemoteKeyCode.KEYCODE_SEARCH,
};

/** Names of the commands the UI is allowed to send. */
export const SUPPORTED_KEYS = Object.keys(KEY_MAP);

/**
 * Map printable characters to key codes so we can "type" into on-screen
 * fields (e.g. a search box) one key event at a time.
 */
const CHAR_TO_KEY = (() => {
  const map = { " ": RemoteKeyCode.KEYCODE_SPACE };
  for (let d = 0; d <= 9; d++) map[String(d)] = RemoteKeyCode[`KEYCODE_${d}`];
  for (let c = 0; c < 26; c++) {
    const letter = String.fromCharCode(97 + c); // a-z
    map[letter] = RemoteKeyCode[`KEYCODE_${letter.toUpperCase()}`];
  }
  return map;
})();

const SECRET_TIMEOUT = 15_000; // wait for the TV to display its pairing code
const READY_TIMEOUT = 15_000; // wait for the remote channel to come up

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

class TvManager extends EventEmitter {
  constructor() {
    super();
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

  /** Broadcast the current status to any SSE subscribers. */
  _emitState() {
    this.emit("state", this.getStatus());
  }

  /** Wire a paired AndroidRemote instance up as the active connection. */
  _activate(remote, host, name) {
    this.remote = remote;
    this.state = { host, name, powered: false, volume: null, currentApp: null };

    remote.on("powered", (powered) => {
      this.state.powered = powered;
      this._emitState();
    });
    remote.on("volume", (volume) => {
      this.state.volume = volume;
      this._emitState();
    });
    remote.on("current_app", (currentApp) => {
      this.state.currentApp = currentApp;
      this._emitState();
    });
    remote.on("unpaired", () => this._teardown());
    remote.on("close", () => this._teardown());

    this._emitState();
  }

  _teardown() {
    this.remote = null;
    this.state = { host: null, name: null, powered: false, volume: null, currentApp: null };
    this._emitState();
  }

  // --- Commands -------------------------------------------------------------

  _requireConnection() {
    if (!this.remote) {
      throw new Error("Not connected to a TV. Pair or connect first.");
    }
  }

  /** Send one of the supported remote buttons by its friendly name. */
  sendKey(name) {
    this._requireConnection();
    const code = KEY_MAP[name];
    if (code === undefined) {
      throw new Error(`Unsupported key: ${name}`);
    }
    this.remote.sendKey(code, RemoteDirection.SHORT);
    return { sent: name };
  }

  /** "Type" a string into the focused field by sending one key per character. */
  sendText(text) {
    this._requireConnection();
    if (typeof text !== "string" || text.length === 0) {
      throw new Error("Text is required.");
    }
    let sent = 0;
    for (const ch of text.toLowerCase()) {
      const code = CHAR_TO_KEY[ch];
      if (code !== undefined) {
        this.remote.sendKey(code, RemoteDirection.SHORT);
        sent++;
      }
    }
    return { sent };
  }

  /** Toggle the TV's power. */
  power() {
    this._requireConnection();
    this.remote.sendPower();
    return { sent: "power" };
  }

  /** Open a deep link / app on the TV, e.g. a YouTube or app:// URL. */
  launchApp(link) {
    this._requireConnection();
    if (!link) throw new Error("An app link is required.");
    this.remote.sendAppLink(link);
    return { sent: "app", link };
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
