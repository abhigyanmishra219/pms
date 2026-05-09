"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const loginWithFingerprint = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/webauthn-login-options", { method: "POST" });
      const options = await res.json();

      if (!res.ok) throw new Error(options.error || "Failed to start");

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          rpId: options.rpId,
          timeout: options.timeout,
          allowCredentials: options.allowCredentials,
          userVerification: "required"
        }
      }) as PublicKeyCredential;

      const verifyRes = await fetch("/api/auth/webauthn-login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: credential.id })
      });

      const data = await verifyRes.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => router.push("/staff/dashboard"), 800);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Fingerprint login failed");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
        <div className="text-5xl mb-6">🔐</div>
        <h1 className="text-2xl font-bold text-white mb-2">Staff Portal</h1>
        <p className="text-gray-400 mb-8">Touch your fingerprint to login</p>

        <button
          onClick={loginWithFingerprint}
          disabled={status === "loading"}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-4 rounded-xl font-semibold text-lg transition-all"
        >
          {status === "loading" ? "Verifying..." : "Verify with Fingerprint"}
        </button>

        {status === "error" && <p className="text-red-500 mt-4">{errorMsg}</p>}
        {status === "success" && <p className="text-green-500 mt-4">Login Successful! Redirecting...</p>}
      </div>
    </div>
  );
}