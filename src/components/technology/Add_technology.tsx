// components/caseStudy/Add_technology.tsx
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  addTechnologyApi,
  getTechnologyByIdApi,
  updateTechnologyApi,
} from "../../services/allAPi";

import slugify from "slugify";
import { imgSrc } from "../../utils/imgSrc";

export default function Add_technology() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [description, setDescription] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [existingLogo, setExistingLogo] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState({ name: "", logo: "",  description: "" });

  // auto-preview slug from name
  useEffect(() => {
    setSlugPreview(
      name.trim()
        ? slugify(name, { lower: true, strict: true, trim: true })
        : ""
    );
  }, [name]);

  // load in edit mode
  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchTech = async () => {
      try {
        const res = await getTechnologyByIdApi(id);
        const tech = res.data.data ?? res.data;
        setName(tech.name);
        setSlugPreview(tech.slug);
        setStatus(tech.isActive);
        setExistingLogo(tech.logo || "");
        setDescription(tech.description || "");
      } catch {
        toast.error("Failed to load technology");
        navigate("/admin-dashtechnology");
      } finally {
        setLoadingData(false);
      }
    };

    fetchTech();
  }, [id]);

  const pickLogo = (file: File | undefined | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, logo: "Only JPG, PNG, WebP or SVG accepted" }));
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setErrors((p) => ({ ...p, logo: "Logo must be under 1 MB" }));
      return;
    }
    setErrors((p) => ({ ...p, logo: "" }));
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const next = { name: "", logo: "",description:"" };
    let ok = true;

    if (!name.trim()) { next.name = "Technology name is required"; ok = false; }
    if (!logoFile && !existingLogo) { next.logo = "Logo is required"; ok = false; }
    if (!description.trim()) {
  next.description = "Description is required";
  ok = false;
}

    setErrors(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("status", String(status));
    fd.append("description", description.trim());
    if (logoFile) fd.append("logo", logoFile);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateTechnologyApi(id, fd);
        toast.success("Technology updated");
      } else {
        await addTechnologyApi(fd);
        toast.success("Technology added");
      }
      navigate("/admin-dash/technology");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("A technology with this name already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const shownLogo = logoPreview || (existingLogo ? imgSrc(existingLogo) : "");

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading technology...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Technology" : "Add Technology"}</h4>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/admin-dash/technology")}
        >
          ← Back to Technologies
        </button>
      </div>

      <div className="p-md-2 mb-4">
        <div className="row">

          {/* LEFT */}
          <div className="col-md-8">

            <label htmlFor="name" className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React.js"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}

            {/* live slug preview */}
            {slugPreview && (
              <p className="text-muted mt-1 mb-0" style={{ fontSize: "13px" }}>
                Slug: <code>{slugPreview}</code>
              </p>
            )}
            <label htmlFor="description" className="form-label mt-3">
  Description <span className="text-danger">*</span>
</label>

<textarea
  id="description"
  rows={4}
  className={`form-control ${errors.description ? "is-invalid" : ""}`}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter technology description"
/>

{errors.description && (
  <div className="invalid-feedback">
    {errors.description}
  </div>
)}

            <label className="form-label mt-3">Status</label>
            <select
              className="form-control"
              style={{ maxWidth: "200px" }}
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <div className="mt-4 d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : isEditMode ? "Update Technology" : "Add Technology"}
              </button>
              {isEditMode && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => navigate("/admin-dash/technology")}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — Logo */}
          <div className="col-md-4">
            <h6>Logo <span className="text-danger">*</span></h6>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              JPG, PNG, WebP or SVG · Max 1 MB<br />
              Recommended: square, transparent background
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              className="d-none"
              onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ""; }}
            />

            {shownLogo ? (
              <div>
                <div
                  className="border d-flex align-items-center justify-content-center"
                  style={{ width: "120px", height: "120px", borderRadius: "10px", background: "#f8f9fa" }}
                >
                  <img
                    src={shownLogo}
                    alt="Logo preview"
                    style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "contain" }}
                  />
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview("");
                      setExistingLogo("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`upload-box text-center p-4 border ${errors.logo ? "border-danger" : ""}`}
                style={{ cursor: "pointer", borderRadius: "10px", width: "120px", height: "120px" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="mb-0 text-primary fw-semibold" style={{ fontSize: "12px" }}>
                  Click to upload
                </p>
                <h5 className="mb-0">+</h5>
              </div>
            )}
            {errors.logo && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.logo}</div>}
          </div>

        </div>
      </div>
    </div>
  );
}