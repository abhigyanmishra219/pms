"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "error" | "success";

export default function StaffLoginPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const router = useRouter();

  const startFingerprintLogin = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      // Step 1: Get login options (challenge + credentials)
      const optionsRes = await fetch("/api/auth/webauthn-login-options", {
        method: "POST",
      });

      const options = await optionsRes.json();

      if (!optionsRes.ok) {
        throw new Error(options.error || "Failed to get login options");
      }

      // Step 2: Ask browser for fingerprint
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          timeout: options.timeout,
          rpId: options.rpId,
          allowCredentials: options.allowCredentials,
          userVerification: options.userVerification,
        },
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Authentication failed or cancelled");
      }

      // Step 3: Send credential to verify
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
        setTimeout(() => {
          router.push("/staff/dashboard");
        }, 800);
      } else {
        throw new Error(data.error || "Verification failed");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Fingerprint login failed");
      setStatus("error");
    }
  };

  return (
    <div className="root">
      {/* Your existing styles remain the same */}
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
            className={`btn ${status === "loading" ? "btn-loading" : ""} ${status === "success" ? "btn-success" : ""}`}
            onClick={startFingerprintLogin}
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <>
                <span className="spinner" />
                Verifying Fingerprint...
              </>
            ) : status === "success" ? (
              "Login Successful ✓"
            ) : (
              <>
                🔐 Verify with Fingerprint
              </>
            )}
          </button>

          {status === "error" && (
            <p className="err-text" style={{ textAlign: "center", marginTop: "12px" }}>
              {errorMsg}
            </p>
          )}
        </div>

        <p className="hint">
          Credentials managed by admin • Contact admin for access issues
        </p>
      </main>

      {/* Keep your existing styles */}
      <style jsx>{`/* Your existing styles here */`}</style>
    </div>
  );
}