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

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

  e.preventDefault();

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

      await updateAdmin_user_Api(edituser._id, {
        name: formData.name,
        email: formData.email,
        password: formData.password, // will update only if provided
        role: formData.role
      });

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

        <form onSubmit={handleSubmit}>

          <div className="row">

            <div className="col-md-6 mb-3">
              <label htmlFor='userName' className="form-label">User Name</label>
              <input
                name='userName'
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor='email' className="form-label">Email</label>
              <input
                name='email'
                type="email"
                className="form-control"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

          </div>

          <div className='row '>

            {/* Password */}
            <div className="mb-3 col-md-6 position-relative px-2" >
              <label htmlFor='password' className="form-label">Password</label>

              <input
                name='password'
                type={showPassword ? "text" : "password"}
                className="form-control"
                required={!isEditMode}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

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
                name='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                required={!isEditMode}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />

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
            <label htmlFor='userType' className="form-label">User Type</label>

            <select
            name='userType'
              className="form-select"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="staff">Staff</option>
            </select>
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
