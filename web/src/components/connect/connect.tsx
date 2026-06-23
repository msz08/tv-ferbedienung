import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RefreshCw, Tv, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError, type TvDevice } from "@/lib/api";

type Step = "select" | "code";

/**
 * Discovery + pairing flow. Scans for TVs, lets the user pick one (or type an
 * IP), triggers the on-screen code, and submits it. Once pairing succeeds the
 * live status stream flips to connected and the parent swaps in the remote.
 */
export function Connect() {
  const [devices, setDevices] = useState<TvDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [manualHost, setManualHost] = useState("");

  const [step, setStep] = useState<Step>("select");
  const [pending, setPending] = useState<{ host: string; name: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = async () => {
    setScanning(true);
    setError(null);
    try {
      const { devices } = await api.discover();
      setDevices(devices);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setScanning(false);
    }
  };

  // Scan once on mount.
  useEffect(() => {
    void scan();
  }, []);

  const startPairing = async (host: string, name: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.pairStart(host, name);
      setPending({ host: res.host, name: res.name });
      setStep("code");
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const finishPairing = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.pairFinish(code.trim());
      // Success: the SSE status stream will report `connected` and the parent
      // unmounts this component.
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setStep("select");
    setPending(null);
    setCode("");
    setError(null);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Connect a TV</h2>
              <Button variant="ghost" size="sm" onClick={scan} disabled={scanning} className="gap-1.5">
                {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Scan
              </Button>
            </div>

            {/* Discovered devices */}
            <div className="space-y-2">
              {devices.length === 0 && !scanning && (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  No TVs found yet. Make sure the TV is on and on the same network, then scan again.
                </p>
              )}
              {devices.map((device) => (
                <button
                  key={device.host}
                  onClick={() => startPairing(device.host, device.name)}
                  disabled={busy}
                  className="flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                    <Tv className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{device.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{device.host}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Manual entry */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-xs font-medium text-muted-foreground">Or enter the TV's IP address</label>
              <div className="flex gap-2">
                <Input
                  value={manualHost}
                  onChange={(e) => setManualHost(e.target.value)}
                  placeholder="192.168.1.42"
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualHost.trim()) startPairing(manualHost.trim(), "Android TV");
                  }}
                />
                <Button
                  onClick={() => startPairing(manualHost.trim(), "Android TV")}
                  disabled={busy || !manualHost.trim()}
                  className="gap-1.5"
                >
                  <Wifi className="h-4 w-4" />
                  Pair
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-sm font-semibold">Enter the pairing code</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A 6-digit code is showing on <span className="font-medium text-foreground">{pending?.name}</span>. Type
                it below to finish pairing.
              </p>
            </div>

            <Input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Code from TV"
              maxLength={6}
              className="text-center text-lg tracking-[0.3em]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && code.trim()) finishPairing();
              }}
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={cancel} disabled={busy} className="flex-1">
                Back
              </Button>
              <Button onClick={finishPairing} disabled={busy || !code.trim()} className="flex-1 gap-1.5">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Pair
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
