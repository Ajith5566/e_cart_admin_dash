/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import {
  getProfileApi,
   updateProfileApi,
} from "../../services/allAPi";

export interface ProfileResponse {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "staff";
  isActive: boolean;
}

import type { AdminUser } from "../../types/types";
import type { AxiosResponse } from "axios";

function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] =
    useState<AdminUser>({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // ================= FETCH PROFILE =================

  const fetchProfile = async () => {
    try {
     const res = await getProfileApi() as AxiosResponse<ProfileResponse>;

      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        password: "",
        confirmPassword: "",
        role: res.data.role || "",
      });
    } catch (error) {
      console.log(error);

      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================= VALIDATION =================

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // password optional
    if (formData.password.trim()) {
      if (
        formData.password !==
        formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match";

        isValid = false;
      }
    }

    setErrors(newErrors);

    return isValid;
  };

  // ================= SUBMIT =================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload: any = {
        name: formData.name,
        email: formData.email,
      };

      // send password only if entered
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      await updateProfileApi(payload);

      toast.success(
        "Profile updated successfully"
      );

      fetchProfile();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Profile update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="container py-4">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            My Profile
          </h2>

          <button
            className="btn btn-secondary"
            onClick={() =>
              navigate("/admin-dash")
            }
          >
            ← Dashboard
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="row">
            {/* Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Name
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <input
                className={`form-control ${
                  errors.name
                    ? "is-invalid"
                    : ""
                }`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />

              {errors.name && (
                <div className="invalid-feedback">
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Email
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <input
                className={`form-control ${
                  errors.email
                    ? "is-invalid"
                    : ""
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />

              {errors.email && (
                <div className="invalid-feedback">
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          <div className="row">
            {/* Role */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Role
              </label>

              <input
                className="form-control"
                value={formData.role}
                disabled
              />
            </div>
          </div>

          <div className="row">
            {/* Password */}
            <div className="col-md-6 mb-3 position-relative">
              <label className="form-label">
                New Password
              </label>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className={`form-control ${
                  errors.password
                    ? "is-invalid"
                    : ""
                }`}
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password:
                      e.target.value,
                  })
                }
              />

              <span
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "40px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                <FontAwesomeIcon
                  icon={
                    showPassword
                      ? faEye
                      : faEyeSlash
                  }
                />
              </span>
            </div>

            {/* Confirm Password */}
            <div className="col-md-6 mb-3 position-relative">
              <label className="form-label">
                Confirm Password
              </label>

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                className={`form-control ${
                  errors.confirmPassword
                    ? "is-invalid"
                    : ""
                }`}
                value={
                  formData.confirmPassword
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword:
                      e.target.value,
                  })
                }
              />

              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {
                    errors.confirmPassword
                  }
                </div>
              )}

              <span
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "40px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                <FontAwesomeIcon
                  icon={
                    showConfirmPassword
                      ? faEye
                      : faEyeSlash
                  }
                />
              </span>
            </div>
          </div>

          <div className="mt-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;