/* eslint-disable react-hooks/set-state-in-effect */
// components/caseStudy/Add_industry.tsx
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  addIndustryApi,
  getIndustryByIdApi,
  updateIndustryApi,
} from "../../services/allAPi";

import slugify from "slugify";
import { imgSrc } from "../../utils/imgSrc";

export default function Add_industry() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState({ name: "", image: "" });

  useEffect(() => {
    setSlugPreview(
      name.trim()
        ? slugify(name, { lower: true, strict: true, trim: true })
        : ""
    );
  }, [name]);

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchIndustry = async () => {
      try {
        const res = await getIndustryByIdApi(id);
        const industry = res.data.data ?? res.data;
        setName(industry.name);
        setSlugPreview(industry.slug);
        setStatus(industry.isActive);
        setExistingImage(industry.image || "");
        setDescription(industry.description || "");
      } catch {
        toast.error("Failed to load industry");
        navigate("/admin-dash/industry");
      } finally {
        setLoadingData(false);
      }
    };

    fetchIndustry();
  }, [id]);

  const pickImage = (file: File | undefined | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, image: "Only JPG, PNG, WebP or SVG accepted" }));
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Image must be under 1 MB" }));
      return;
    }
    setErrors((p) => ({ ...p, image: "" }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ✅ only name is mandatory
  const validateForm = () => {
    const next = { name: "", image: "" };
    let ok = true;

    if (!name.trim()) { next.name = "Industry name is required"; ok = false; }

    setErrors(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("status", String(status));
    fd.append("description", description.trim());
    if (imageFile) fd.append("image", imageFile);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateIndustryApi(id, fd);
        toast.success("Industry updated");
      } else {
        await addIndustryApi(fd);
        toast.success("Industry added");
      }
      navigate("/admin-dash/industry");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("An industry with this name already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const shownImage = imagePreview || (existingImage ? imgSrc(existingImage) : "");

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading industry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Industry" : "Add Industry"}</h4>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/admin-dash/industry")}
        >
          ← Back to Industries
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
              placeholder="e.g. Healthcare"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}

            {slugPreview && (
              <p className="text-muted mt-1 mb-0" style={{ fontSize: "13px" }}>
                Slug: <code>{slugPreview}</code>
              </p>
            )}

            <label htmlFor="description" className="form-label mt-3">
              Description <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span>
            </label>

            <textarea
              id="description"
              rows={4}
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter industry description"
            />

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
                {loading ? "Saving..." : isEditMode ? "Update Industry" : "Add Industry"}
              </button>
              {isEditMode && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => navigate("/admin-dash/industry")}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — Image (optional) */}
          <div className="col-md-4">
            <h6>Image <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span></h6>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              JPG, PNG, WebP or SVG · Max 1 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              className="d-none"
              onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }}
            />

            {shownImage ? (
              <div>
                <div
                  className="border d-flex align-items-center justify-content-center"
                  style={{ width: "120px", height: "120px", borderRadius: "10px", background: "#f8f9fa" }}
                >
                  <img
                    src={shownImage}
                    alt="Image preview"
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
                      setImageFile(null);
                      setImagePreview("");
                      setExistingImage("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`upload-box text-center p-4 border ${errors.image ? "border-danger" : ""}`}
                style={{ cursor: "pointer", borderRadius: "10px", width: "120px", height: "120px" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="mb-0 text-primary fw-semibold" style={{ fontSize: "12px" }}>
                  Click to upload
                </p>
                <h5 className="mb-0">+</h5>
              </div>
            )}
            {errors.image && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.image}</div>}
          </div>

        </div>
      </div>
    </div>
  );
}