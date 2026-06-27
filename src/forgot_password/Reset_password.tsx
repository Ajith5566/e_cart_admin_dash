import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { resetPasswordApi, verifyResetTokenApi } from "../services/allAPi";
import "./ResetPassword.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

type ResetPasswordResponse = {
  message?: string;
};

function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // null = checking, true = valid, false = expired/invalid
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        await verifyResetTokenApi(token!);
        setTokenValid(true);
      } catch {
        setTokenValid(false);
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordApi(token!, password);
      console.log(res);
      
      const data = res.data as ResetPasswordResponse;

      setMessage(data.message || "Password updated successfully");
      setIsSuccess(true);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg =
          (error.response?.data as { message?: string })?.message ||
          "Failed to reset password";
        setMessage(msg);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking token validity
  if (tokenValid === null) {
    return (
      <div className="reset-wrapper">
        <div className="reset-card">
          <p className="subtitle">Checking link...</p>
        </div>
      </div>
    );
  }

  // Token expired/invalid — show this immediately, no form
  if (tokenValid === false) {
    return (
      <div className="reset-wrapper">
        <div className="reset-card success-card">
          <FontAwesomeIcon icon={faTimesCircle} className="error-icon" />
          <h2>Link Expired</h2>
          <p className="subtitle">This reset link has expired. Please request a new one.</p>
          <a href="/forgot-password" className="login-link">Request New Link</a>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="reset-wrapper">
        <div className="reset-card success-card">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <h2>Password Reset!</h2>
          <p className="subtitle">Your password has been updated successfully.</p>
          <a href="/" className="login-link">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter your new password below</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword
                ? <FontAwesomeIcon icon={faEye} />
                : <FontAwesomeIcon icon={faEyeSlash} />}
            </span>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;