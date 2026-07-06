import { useState } from "react";
import { forgotPasswordApi } from "../services/allAPi";
import "./ForgotPassword.css";
import axios from "axios";

type ForgotPasswordResponse = {
  message?: string;
};

type Status = "idle" | "loading" | "success" | "error";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(name.length - 1, 3))}@${domain}`;
}

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const loading = status === "loading";
  const success = status === "success";
  const error = status === "error";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await forgotPasswordApi(email);
      const data = response.data as ForgotPasswordResponse;
      setMessage(data.message || "Reset link sent.");
      setStatus("success");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.message || "Request failed. Try again.");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
      setStatus("error");
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">

        {/* ── Header block — matches the Admin panel login header ── */}
        <div className="fp-header">
          <div className={`fp-icon-badge ${success ? "is-success" : ""}`}>
            {success ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <h1 className="fp-title">{success ? "Check your email" : "Forgot password?"}</h1>
          <p className="fp-subtitle">
            {success
              ? "We've sent a reset link to your inbox"
              : "Enter your email to reset your password"}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="fp-body">
          {!success ? (
            <form onSubmit={handleSubmit} noValidate>
              <label className="fp-label" htmlFor="fp-email">
                Email address
              </label>
              <input
                id="fp-email"
                className={`fp-input ${error ? "has-error" : ""}`}
                type="email"
                placeholder="admin@company.com"
                required
                autoComplete="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <p className="fp-inline-error" role="alert">
                  {message}
                </p>
              )}

              <button className="fp-submit" type="submit" disabled={loading}>
                {loading ? (
                  <span className="fp-spinner" aria-hidden="true" />
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {loading ? "Sending link" : "Send reset link"}
              </button>

              <a className="fp-back" href="/">
                Back to sign in
              </a>
            </form>
          ) : (
            <div className="fp-success-body">
              <p className="fp-success-detail">
                Sent to <strong>{maskEmail(email)}</strong>. The link expires in 15 minutes.
              </p>

              <button
                type="button"
                className="fp-resend"
                onClick={() => {
                  setStatus("idle");
                  setMessage("");
                }}
              >
                Didn't get it? Send again
              </button>

              <a className="fp-back" href="/">
                Back to sign in
              </a>
            </div>
          )}

          <div className="fp-divider" />

          <p className="fp-footer">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Protected by enterprise security
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;