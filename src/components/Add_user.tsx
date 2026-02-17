/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from "react-toastify"
import type { AdminUser } from '../types/types'
import {
  register_AdminUser_Api,
  updateAdmin_user_Api
} from '../services/allAPi'

function Add_user() {

  const navigate = useNavigate()
  const location = useLocation()

  const edituser = location.state?.user
  const isEditMode = !!edituser

  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState<AdminUser>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });


  /* ---------- LOAD EDIT DATA ---------- */

  useEffect(() => {

    if (!edituser) return

    setFormData({
      name: edituser.name ?? "",
      email: edituser.email ?? "",
      password: "",
      confirmPassword: "",
      role: edituser.role ?? ""
    })

  }, [edituser])



  /* validation error */
  const validateForm = () => {

    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: ""
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    // ADD MODE
    if (!isEditMode) {

      if (!formData.password.trim()) {
        newErrors.password = "Password required";
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    // EDIT MODE
    if (isEditMode && formData.password.trim()) {

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);

    return isValid;
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    if (!validateForm()) return;


    try {

      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error("All fields required");
        return;
      }

      // ⭐ ADD MODE validation
      if (!isEditMode) {

        if (!formData.password.trim()) {
          toast.error("Password required");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      }

      // ⭐ EDIT MODE validation
      if (isEditMode && formData.password.trim()) {

        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      }

      setLoading(true);

      if (isEditMode) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };

        // ONLY send password if user entered
        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        await updateAdmin_user_Api(edituser._id, payload);

        toast.success("User updated");

      } else {

        await register_AdminUser_Api(formData);

        toast.success("User created successfully");
      }

      navigate("/admin-dash/user");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {

      toast.error(error?.response?.data?.message || "Action failed");

    } finally {

      setLoading(false);
    }
  };


  /* ---------- UI ---------- */

  return (

    <div className="container py-4">

      <div className="card shadow p-4">

        <div className='d-flex justify-content-between'>
          <h2 className="mb-4 fw-bold">
            {isEditMode ? "Edit User" : "Add User"}
          </h2>

          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/admin-dash/user")}
          >
            ← Back to users
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <div className="row">
            {/* user name */}
            <div className="col-md-6 mb-3">
              <label htmlFor='userName' className="form-label">User Name <span className="text-danger">*</span></label>
              <input
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            {/* email */}
            <div className="col-md-6 mb-3">
              <label htmlFor='email' className="form-label">Email <span className="text-danger">*</span></label>
              <input
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          </div>

          <div className='row '>
            {/* Password */}
            <div className="mb-3 col-md-6 position-relative px-2" >
              <label htmlFor='password' className="form-label">Password <span className="text-danger">*</span></label>

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                required={!isEditMode}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}

              <span
                style={{ position: "absolute", right: "10px", top: "38px", cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                👁️
              </span>
            </div>

            {/* Confirm Password */}
            <div className="mb-3 col-md-6 position-relative px-2">
              <label htmlFor='confirmPassword' className="form-label">Confirm Password</label>

              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                required={!isEditMode}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />

              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}


              <span
                style={{ position: "absolute", right: "10px", top: "38px", cursor: "pointer" }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                👁️
              </span>
            </div>

          </div>

          {/* Role */}
          <div className="mb-3 w-50">
            <label htmlFor='userType' className="form-label">User Type <span className="text-danger">*</span></label>

            <select
              name="role"
              className={`form-select ${errors.role ? "is-invalid" : ""}`}
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="staff">Staff</option>
            </select>

            {errors.role && (
              <div className="invalid-feedback">{errors.role}</div>
            )}

          </div>

          {/* Submit */}
          <div className="mt-3 d-flex gap-2">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? <span className="spinner-border spinner-border-sm"></span>
                : isEditMode ? "Update User" : "Add User"}
            </button>

            {isEditMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin-dash/user")}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  )
}

export default Add_user
