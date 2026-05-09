"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const startFingerprintLogin = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/webauthn-login-options", { method: "POST" });
      const options = await res.json();

      if (!res.ok) throw new Error(options.error || "Failed to start");

      const allowCredentials = options.allowCredentials.map((cred: any) => ({
        type: cred.type,
        id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/').padEnd(cred.id.length + (4 - cred.id.length % 4) % 4, '=')), (c) => c.charCodeAt(0)),
        transports: cred.transports,
      }));

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/').padEnd(options.challenge.length + (4 - options.challenge.length % 4) % 4, '=')), (c) => c.charCodeAt(0)),
          rpId: options.rpId,
          timeout: options.timeout,
          allowCredentials,
          userVerification: "required",
        },
      }) as PublicKeyCredential;

      const verifyRes = await fetch("/api/auth/webauthn-login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: credential.id }),
      });

      const data = await verifyRes.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => router.push("/staff/dashboard"), 800);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Fingerprint login failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <span className="text-5xl">🔐</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 bg-white/10 text-cyan-400 text-xs tracking-widest font-mono rounded-full mb-3">
              STAFF PORTAL
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Identity Verification</h1>
            <p className="text-gray-400 text-lg">Touch your fingerprint to login</p>
          </div>

          {/* Fingerprint Button */}
          <button
            onClick={startFingerprintLogin}
            disabled={status === "loading" || status === "success"}
            className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3
              ${status === "loading" 
                ? "bg-gray-700 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 shadow-lg shadow-blue-500/50"
              }`}
          >
            {status === "loading" ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying Fingerprint...
              </>
            ) : status === "success" ? (
              "✅ Login Successful"
            ) : (
              <>
                🔐 Verify with Fingerprint
              </>
            )}
          </button>

          {/* Status Messages */}
          {status === "error" && (
            <div className="mt-6 text-red-400 text-center text-sm bg-red-900/30 border border-red-500/30 rounded-xl p-4">
              {errorMsg}
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 text-emerald-400 text-center text-sm bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4">
              Redirecting to dashboard...
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-10">
            Credentials managed by admin • Contact admin for access issues
          </p>
        </div>
      </div>
    </div>
  );
}