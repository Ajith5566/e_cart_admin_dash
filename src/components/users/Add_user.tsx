/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom' // ✅ removed useLocation
import { toast } from "react-toastify"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import {  getuserByIdApi, register_AdminUser_Api, updateAdmin_user_Api } from '../../services/allAPi' // ✅ add getAdminUserByIdApi
import type { AdminUser } from '../../types/types'

function Add_user() {

  const navigate = useNavigate()
  const { id } = useParams();               // ✅ get id from URL
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!id) // ✅ based on id

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

  // ✅ Fetch user by ID from API (refresh-safe)
  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await getuserByIdApi(id);
        console.log(res.data);

        // adjust based on your backend response shape
        const user = res.data.data ?? res.data;

        setFormData({
          name:            user.name  ?? "",
          email:           user.email ?? "",
          password:        "",
          confirmPassword: "",
          role:            user.role  ?? "",
        });
      } catch {
        toast.error("Failed to load user");
        navigate("/admin-dash/user");
      } finally {
        setLoadingData(false);
      }
    };

    fetchUser();
  }, [id]);

  const validateForm = () => {
    const newErrors = {
      name: "", email: "", password: "", confirmPassword: "", role: ""
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

    if (isEditMode && formData.password.trim()) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditMode) {
        const payload: any = {
          name:  formData.name,
          email: formData.email,
          role:  formData.role,
        };

        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        await updateAdmin_user_Api(id!, payload); // ✅ use id from URL
        toast.success("User updated");

      } else {
        await register_AdminUser_Api(formData);
        toast.success("User created successfully");
      }

      navigate("/admin-dash/user");

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Action failed");
      console.log(error);
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (loadingData) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between">
          <h2 className="mb-4 fw-bold">{isEditMode ? "Edit User" : "Add User"}</h2>
          <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/user")}>
            ← Back to users
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="d-flex justify-content-between">
        <h2 className="mb-4 fw-bold">{isEditMode ? "Edit User" : "Add User"}</h2>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/user")}>
          ← Back to users
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Name <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Email <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>

        <div className="row">
          <div className="mb-3 col-md-6 position-relative px-2">
            <label className="form-label">
              Password {!isEditMode && <span className="text-danger">*</span>}
              {isEditMode && <span className="text-muted small"> (leave blank to keep current)</span>}
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              required={!isEditMode}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            <span
              style={{ position: "absolute", right: "10px", top: "38px", cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </span>
          </div>

          <div className="mb-3 col-md-6 position-relative px-2">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              required={!isEditMode}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            <span
              style={{ position: "absolute", right: "10px", top: "38px", cursor: "pointer" }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </span>
          </div>
        </div>

        <div className="mb-3 w-50">
          <label className="form-label">User Type <span className="text-danger">*</span></label>
          <select
            name="role"
            className={`form-select ${errors.role ? "is-invalid" : ""}`}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="staff">Staff</option>
          </select>
          {errors.role && <div className="invalid-feedback">{errors.role}</div>}
        </div>

        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <span className="spinner-border spinner-border-sm"></span>
              : isEditMode ? "Update User" : "Add User"
            }
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
  );
}

export default Add_user;