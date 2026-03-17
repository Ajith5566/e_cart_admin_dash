import { useState } from "react";
import { useParams } from "react-router-dom";
import { resetPasswordApi } from "../services/allAPi";
import "./ResetPassword.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

type ResetPasswordResponse = {
  message?: string;
};

function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    setMessage("Passwords do not match");
    return;
  }

  try {

    const res = await resetPasswordApi(token!, password);

    const data = res.data as ResetPasswordResponse;

    setMessage(data.message || "Password updated successfully");

  } catch (error: unknown) {

    if (axios.isAxiosError(error)) {

      const message =
        (error.response?.data as { message?: string })?.message ||
        "Failed to reset password";

      setMessage(message);

    } else {
      setMessage("Something went wrong. Please try again.");
    }

  }
};

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

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ?<FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </span>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit">Reset Password</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;