/* eslint-disable react-hooks/set-state-in-effect */
// components/author/Add_blog_author.tsx — twitter + imgSrc fix + bulk-ready
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  add_author_Api,
  getAuthorByIdApi,
  updateAuthorApi,
} from "../../services/allAPi";
import type { AuthorResponse, AuthorTypes } from "../../types/author_types";
import { imgSrc } from "../../utils/imgSrc"; // ✅ resolves local paths
const RichEditor = lazy(() => import("../editor/TiptapEditor"));

function Add_blog_author() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(!!id);

  const [formData, setFormData] = useState<AuthorTypes>({
    name: "",
    description: "",
    tagline: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
    twitter: "",   // ✅ twitter added
    status: true,
    image: null,
  });

  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchAuthor = async () => {
      try {
        const res = await getAuthorByIdApi(id);
        const author: AuthorResponse = res.data.data ?? res.data;

        setFormData({
          name:        author.name,
          tagline:     author.tagline     || "",
          description: author.description || "",
          status:      author.isActive,
          image:       null,
          linkedin:    author.linkedin    || "",
          facebook:    author.facebook    || "",
          instagram:   author.instagram   || "",
          youtube:     author.youtube     || "",
          twitter:     author.twitter     || "", // ✅
        });

        if (author.image) setExistingImages([author.image]);
      } catch {
        toast.error("Failed to load author");
        navigate("/admin-dash/blogAuthor");
      } finally {
        setLoadingData(false);
      }
    };

    fetchAuthor();
  }, [id]);

  const validateForm = () => {
    const newErrors = { name: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Author name is required";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) scrollToFirstError(newErrors);
    return isValid;
  };

  const scrollToFirstError = (newErrors: typeof errors) => {
    const firstErrorKey = Object.keys(newErrors).find(
      (key) => newErrors[key as keyof typeof newErrors] !== ""
    );
    if (!firstErrorKey) return;
    const element = document.getElementById(firstErrorKey);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => (element as HTMLElement).focus(), 300);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const removeExistingImage = () => setExistingImages([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name",          formData.name.trim());
      payload.append("tagline",       formData.tagline.trim()  || "");
      payload.append("description",   formData.description);
      payload.append("instagram",     formData.instagram       || "");
      payload.append("linkedin",      formData.linkedin        || "");
      payload.append("facebook",      formData.facebook        || "");
      payload.append("youtube",       formData.youtube         || "");
      payload.append("twitter",       formData.twitter         || ""); // ✅
      payload.append("status",        String(formData.status));
      payload.append("existingImage", existingImages[0]        || "");

      if (formData.image) payload.append("image", formData.image);

      if (isEditMode) {
        await updateAuthorApi(id!, payload);
        toast.success("Author updated");
      } else {
        await add_author_Api(payload);
        toast.success("Author added successfully");
      }

      navigate("/admin-dash/blogAuthor");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("Author already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex justify-content-between">
          <h4 className="fw-bold">{isEditMode ? "Edit Author" : "Add Author"}</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/blogAuthor")}>
            ← Back to Authors
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading author...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">

      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Author" : "Add Author"}</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/blogAuthor")}>
          ← Back to Authors
        </button>
      </div>

      <div className="row mt-2">

        {/* LEFT */}
        <div className="col-md-9 col-12 p-4">

          <div className="row">
            <div className="col-md-6">
              <label className="form-label">
                Author Name <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="tagline" className="form-label">Tagline</label>
              <input
                id="tagline"
                value={formData.tagline}
                className="form-control"
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <h6>Description</h6>
            <Suspense fallback={<div>Loading editor...</div>}>
             <RichEditor
  value={formData.description}
  onChange={(value) => setFormData({ ...formData, description: value })}
  placeholder="Write job description..."
  minHeight={200}
/>
            </Suspense>
          </div>

          {/* Social links */}
          <div className="row mt-3">
            <div className="col-md-6">
              <label className="form-label">LinkedIn</label>
              <input
                id="linkedin"
                className="form-control"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="instagram" className="form-label">Instagram</label>
              <input
                id="instagram"
                className="form-control"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label className="form-label">Facebook</label>
              <input
                id="facebook"
                className="form-control"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="youtube" className="form-label">YouTube</label>
              <input
                id="youtube"
                className="form-control"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              />
            </div>
          </div>

          {/* ✅ Twitter / X */}
          <div className="row mt-3">
            <div className="col-md-6">
              <label className="form-label">Twitter / X</label>
              <input
                id="twitter"
                className="form-control"
                placeholder="https://x.com/username"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              />
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-md-3 col-12 p-md-4 p-2">

          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={formData.status ? "true" : "false"}
            onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
          >
            <option value="true">Active</option>
            <option value="false">Draft</option>
          </select>

          <div className="mt-4">
            <h6>Image</h6>
            <p className="font_small text-justify">
              Preferred dimension is 300px x 300px.
              Allowed file types: jpg, jpeg, png, webp.
              Maximum file size: 2 MB.
            </p>

            {/* Upload box — shown only when no image selected */}
            {!previewImage && existingImages.length === 0 && (
              <div className="upload-box text-center p-5 border">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="d-none"
                  id="imageUpload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, image: file }));
                    setPreviewImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
                <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                  <p className="text-primary fw-semibold mb-0">
                    Click / Drop file here to upload
                  </p>
                </label>
              </div>
            )}

            {/* ✅ FIXED: imgSrc() prefixes server origin for DB paths */}
            {(previewImage || existingImages.length > 0) && (
              <div className="mt-3">
                <img
                  src={previewImage || imgSrc(existingImages[0])}
                  className="img-thumbnail w-100"
                  alt="Author"
                />
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={previewImage ? removeImage : removeExistingImage}
                  >
                    Remove
                  </button>
                </div>
                {/* hidden input for Change button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="d-none"
                  id="imageUpload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, image: file }));
                    setPreviewImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : isEditMode ? "Update Author" : "Add Author"}
        </button>
      </div>

    </div>
  );
}

export default Add_blog_author;