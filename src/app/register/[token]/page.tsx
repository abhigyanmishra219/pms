"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type Status = "loading" | "ready" | "registering" | "success" | "error" | "expired"

export default function RegisterFingerprint() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<Status>("loading")
  const [staffName, setStaffName] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch(`/api/register/verify?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          setStaffName(d.name)
          setStatus("ready")
        } else {
          setStatus("expired")
          setMessage(d.error)
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Something went wrong.")
      })
  }, [token])

  async function registerFingerprint() {
    setStatus("registering")
    try {
      const optRes = await fetch("/api/register/webauthn-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
      const options = await optRes.json()
      if (!optRes.ok) throw new Error(options.error)

      options.challenge = base64urlToBuffer(options.challenge)
      options.user.id = base64urlToBuffer(options.user.id)

      const credential = await navigator.credentials.create({ publicKey: options })
      if (!credential) throw new Error("No credential returned")

      const cred = credential as PublicKeyCredential
      const response = cred.response as AuthenticatorAttestationResponse

      const saveRes = await fetch("/api/register/webauthn-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          credentialId: bufferToBase64url(cred.rawId),
          publicKey: bufferToBase64url(response.getPublicKey()!),
        })
      })

      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveData.error)

      setStatus("success")

    } catch (err: any) {
      setStatus("error")
      setMessage(err.message || "Fingerprint registration failed.")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fafb",
      padding: "1rem"
    }}>
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "2.5rem 2rem",
        width: "100%",
        maxWidth: 360,
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>

        {status === "loading" && (
          <p style={{ color: "#6b7280", fontSize: 14 }}>Verifying your link...</p>
        )}

        {status === "ready" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
              Hi, {staffName}!
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: "0 0 24px" }}>
              Tap below to register your fingerprint.
            </p>
            <button onClick={registerFingerprint} style={{
              width: "100%", padding: "14px",
              background: "#2563eb", color: "white",
              border: "none", borderRadius: 12,
              fontSize: 16, fontWeight: 600, cursor: "pointer"
            }}>
              Register Fingerprint
            </button>
          </>
        )}

        {status === "registering" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🖐️</div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Waiting...</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              Follow the fingerprint prompt on your device.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>All set!</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              Fingerprint registered. You can now log in.
            </p>
          </>
        )}

        {(status === "error" || status === "expired") && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>
              {status === "expired" ? "Link expired" : "Something went wrong"}
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>{message}</p>
          </>
        )}

      </div>
    </div>
  )
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}