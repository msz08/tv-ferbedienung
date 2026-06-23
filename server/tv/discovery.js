/**
 * mDNS / Bonjour discovery for Android TV devices.
 *
 * Android TV Remote Protocol v2 devices advertise the service type
 * `_androidtvremote2._tcp` on the local network. We browse for it for a short
 * window and return the unique devices we find.
 */
import { Bonjour } from "bonjour-service";

/**
 * Browse the local network for Android TVs.
 *
 * @param {object}  [opts]
 * @param {number}  [opts.timeout=4000]  How long to listen, in milliseconds.
 * @returns {Promise<Array<{name:string, host:string, port:number}>>}
 */
export function discoverTvs({ timeout = 4000 } = {}) {
  return new Promise((resolve) => {
    const bonjour = new Bonjour();
    const devices = new Map();

    const browser = bonjour.find({ type: "androidtvremote2", protocol: "tcp" });

    browser.on("up", (service) => {
      // Prefer an explicit IPv4 address; fall back to the responder address.
      const ipv4 = service.addresses?.find((addr) => addr.includes("."));
      const host = ipv4 || service.referer?.address || service.host;
      if (!host) return;

      devices.set(host, {
        name: service.name || service.host || host,
        host,
        port: service.port || 6466,
      });
    });

    const finish = () => {
      try {
        browser.stop();
      } catch {
        /* ignore */
      }
      bonjour.destroy();
      resolve([...devices.values()]);
    };

    setTimeout(finish, timeout);
  });
}
