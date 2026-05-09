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
      const res = await fetch("/api/auth/webauthn-login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const options = await res.json();

      if (!res.ok) throw new Error(options.error || "Failed to start login");

      // Trigger Fingerprint Prompt
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(options.challenge), (c) => c.charCodeAt(0)),
          timeout: options.timeout,
          rpId: options.rpId,
          allowCredentials: options.allowCredentials,
          userVerification: "required",
        },
      }) as PublicKeyCredential;

      if (!credential) throw new Error("No credential returned");

      // Send for verification
      const verifyRes = await fetch("/api/auth/webauthn-login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId: credential.id,
          authenticatorData: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).clientDataJSON)),
          signature: Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature)),
        }),
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
      setErrorMsg(err.message || "Fingerprint login failed. Try again.");
      setStatus("error");
    }
  };

  return (
    <div className="root">
      <div className="bg-noise" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <main className="card">
        <div className="accent-bar" />

        <div className="icon-ring">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 10C16.268 10 10 16.268 10 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 15C19.029 15 15 19.029 15 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 20C21.239 20 19 22.239 19 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
            <path d="M24 29C26.761 29 29 26.761 29 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 34C28.971 34 33 29.971 33 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M24 38C31.732 38 38 31.732 38 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="heading-block">
          <span className="badge">STAFF PORTAL</span>
          <h1 className="title">Identity Verification</h1>
          <p className="subtitle">Touch your fingerprint sensor to login</p>
        </div>

        <div className="field-wrap">
          <button
            className={`btn ${status === "loading" ? "btn-loading" : ""}`}
            onClick={startFingerprintLogin}
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "🔄 Verifying Fingerprint..." : "🔐 Verify with Fingerprint"}
          </button>

          {status === "error" && <p className="err-text">{errorMsg}</p>}
          {status === "success" && <p className="success-text">✅ Login Successful! Redirecting...</p>}
        </div>

        <p className="hint">
          Credentials managed by admin • Contact admin for access issues
        </p>
      </main>

      <style jsx>{`
        /* Keep your existing beautiful styles here */
        .root { min-height: 100vh; background: #04080f; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .card { width: 430px; background: rgba(10,18,30,0.95); border-radius: 20px; padding: 20px; text-align: center; }
        .btn { width: 100%; padding: 14px; background: #6366f1; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .btn-loading { opacity: 0.7; cursor: not-allowed; }
        .err-text { color: #ef4444; margin-top: 12px; }
        .success-text { color: #10b981; margin-top: 12px; }
      `}</style>
    </div>
  );
}