"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "error" | "success";

interface StaffData {
  id: string;
  name: string;
  role: string;
}

export default function StaffLoginPage() {
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data: { success: boolean; message: string; staff?: StaffData } =
        await res.json();

      if (data.success && data.staff) {
        sessionStorage.setItem("staff", JSON.stringify(data.staff));
        setStatus("success");
        setTimeout(() => router.push("/staff/dashboard"), 900);
      } else {
        setErrorMsg(data.message || "Login failed");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  const isDisabled = status === "loading" || status === "success";

  return (
    <div className="root">
      {/* Animated background */}
      <div className="bg-noise" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <main className="card">
        {/* Top accent bar */}
        <div className="accent-bar" />

        {/* Fingerprint icon */}
        <div className="icon-ring">
          <svg
            width="44"
            height="44"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 10C16.268 10 10 16.268 10 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={status === "loading" ? "spin-path" : ""}
            />
            <path
              d="M24 15C19.029 15 15 19.029 15 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M24 20C21.239 20 19 22.239 19 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="24" r="2.5" fill="currentColor" />
            <path
              d="M24 29C26.761 29 29 26.761 29 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M24 34C28.971 34 33 29.971 33 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M24 38C31.732 38 38 31.732 38 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="heading-block">
          <span className="badge">STAFF PORTAL</span>
          <h1 className="title">Identity Verification</h1>
          <p className="subtitle">
            Enter your registered name to access the dashboard
          </p>
        </div>

        {/* Input */}
        <div className="field-wrap">
          <label htmlFor="staff-name" className="field-label">
            Full Name
          </label>
          <div
            className={`input-box ${status === "error" ? "box-err" : ""} ${
              status === "success" ? "box-ok" : ""
            }`}
          >
            <svg
              className="field-icon"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 10a4 4 0 100-8 4 4 0 000 8z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              id="staff-name"
              type="text"
              className="name-input"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStatus("idle");
                setErrorMsg("");
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              disabled={isDisabled}
            />
            {status === "success" && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                className="check-icon"
              >
                <path
                  d="M4 10l4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {status === "error" && (
            <p className="err-text">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M8 5v3M8 11h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {errorMsg}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          className={`btn ${status === "loading" ? "btn-loading" : ""} ${
            status === "success" ? "btn-success" : ""
          }`}
          onClick={handleLogin}
          disabled={isDisabled}
        >
          {status === "loading" ? (
            <>
              <span className="spinner" />
              Verifying...
            </>
          ) : status === "success" ? (
            <>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10l4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Redirecting...
            </>
          ) : (
            <>
              Verify &amp; Continue
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12M12 6l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>

        <p className="hint">
          Credentials managed by admin &bull; Contact admin for access issues
        </p>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          min-height: 100vh;
          background: #04080f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .bg-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 200px;
          opacity: 0.6;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%);
          top: -100px; right: -100px;
        }

        .orb-2 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%);
          bottom: -80px; left: -80px;
          animation-delay: -4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        .card {
          position: relative;
          width: 430px;
          max-width: 100%;
          background: rgba(10, 18, 30, 0.9);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          padding: 0 0 36px;
          overflow: hidden;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 40px 100px rgba(0,0,0,0.8);
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .accent-bar {
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #10b981, #6366f1);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .icon-ring {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          margin: 32px auto 24px;
          color: #818cf8;
          box-shadow: 0 0 30px rgba(99,102,241,0.2);
          animation: glow 2.5s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
          50%       { box-shadow: 0 0 40px rgba(99,102,241,0.45); }
        }

        .heading-block {
          text-align: center;
          padding: 0 36px;
          margin-bottom: 28px;
        }

        .badge {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #10b981;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .title {
          font-size: 26px;
          font-weight: 800;
          color: #e2e8f0;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 13.5px;
          color: rgba(148,163,184,0.6);
          line-height: 1.55;
          font-weight: 400;
        }

        .field-wrap {
          padding: 0 32px;
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(99,102,241,0.8);
          margin-bottom: 8px;
        }

        .input-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 11px;
          padding: 0 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-box:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .input-box.box-err {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }

        .input-box.box-ok {
          border-color: rgba(16,185,129,0.5);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }

        .field-icon {
          color: rgba(99,102,241,0.5);
          flex-shrink: 0;
        }

        .name-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #e2e8f0;
          padding: 14px 0;
          caret-color: #818cf8;
        }

        .name-input::placeholder { color: rgba(100,116,139,0.5); }
        .name-input:disabled { opacity: 0.55; cursor: not-allowed; }

        .check-icon { color: #10b981; flex-shrink: 0; }

        .err-text {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: rgba(252,165,165,0.9);
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: calc(100% - 64px);
          margin: 4px 32px 20px;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.4);
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.55);
        }

        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { cursor: not-allowed; opacity: 0.75; }
        .btn.btn-loading { background: linear-gradient(135deg, #4338ca, #3730a3); }
        .btn.btn-success { background: linear-gradient(135deg, #059669, #047857); }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .hint {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(100,116,139,0.45);
          padding: 0 32px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}