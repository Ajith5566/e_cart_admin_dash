import { useState } from "react";
import { forgotPasswordApi } from "../services/allAPi";
import "./ForgotPassword.css";

type ForgotPasswordResponse = {
  message?: string;
};

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await forgotPasswordApi(email);
      console.log(response);
      

      const data = response.data as ForgotPasswordResponse;

      setMessage(data.message || "Reset link sent to email");

    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <h2>Forgot Password</h2>

        <p className="subtitle">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;