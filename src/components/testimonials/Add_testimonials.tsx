// components/testimonials/Add_testimonial.tsx — text + video types
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  add_testimonial_Api,
  getTestimonialbyIdApi,
  updatetestimonialApi,
} from "../../services/allAPi";
import type { TestimonialResponse, TestimonialTypes } from "../../types/testimonialTypes";
import { imgSrc } from "../../utils/imgSrc";

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
const VIMEO_REGEX   = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
const isValidVideoUrl = (url: string) => YOUTUBE_REGEX.test(url) || VIMEO_REGEX.test(url);

function Add_testimonial() {
  const [loading, setLoading]     = useState(false);
  const fileInputRef              = useRef<HTMLInputElement | null>(null);
  const { id }                    = useParams();
  const isEditMode                = !!id;
  const navigate                  = useNavigate();

  // ── type toggle ───────────────────────────────────
  const [type, setType] = useState<"text" | "video">("text");

  // ── common fields ─────────────────────────────────
  const [name, setName]               = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany]         = useState("");
  const [status, setStatus]           = useState(true);

  // ── image ─────────────────────────────────────────
  const [previewImage, setPreviewImage]   = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFile, setImageFile]         = useState<File | null>(null);

  // ── text testimonial ──────────────────────────────
  const [message, setMessage] = useState("");
  const [url, setUrl]         = useState("");

  // ── video testimonial ─────────────────────────────
  const [videoUrl, setVideoUrl] = useState("");
  const [quote, setQuote]       = useState("");

  const [loadingData, setLoadingData] = useState(!!id);

  const [errors, setErrors] = useState({
    name: "", message: "", url: "", videoUrl: "", image: "",
  });

  // ── fetch in edit mode ────────────────────────────
  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchTestimonial = async () => {
      try {
        const res = await getTestimonialbyIdApi(id);
        const t: TestimonialResponse = res.data.data ?? res.data;

        setType(t.type === "video" ? "video" : "text");
        setName(t.name);
        setDesignation(t.designation || "");
        setCompany(t.company         || "");
        setMessage(t.message         || "");
        setUrl(t.url                 || "");
        setVideoUrl(t.videoUrl       || "");
        setQuote(t.quote             || "");
        setStatus(t.isActive);
        if (t.image) setExistingImages([t.image]);
      } catch {
        toast.error("Failed to load testimonial");
        navigate("/admin-dash/testimonials");
      } finally {
        setLoadingData(false);
      }
    };

    fetchTestimonial();
  }, [id]);

  const validateForm = () => {
    const next = { name: "", message: "", url: "", videoUrl: "", image: "" };
    let ok = true;
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;

    if (!name.trim()) { next.name = "Name is required"; ok = false; }

    if (type === "text") {
      if (!message.trim()) { next.message = "Message is required"; ok = false; }
      if (url.trim() && !urlRegex.test(url.trim())) { next.url = "Please enter a valid URL"; ok = false; }
    }

    if (type === "video") {
      if (!videoUrl.trim()) {
        next.videoUrl = "Video URL is required"; ok = false;
      } else if (!isValidVideoUrl(videoUrl.trim())) {
        next.videoUrl = "Please enter a valid YouTube or Vimeo URL"; ok = false;
      }
      if (!imageFile && existingImages.length === 0) {
        next.image = "Thumbnail is required for video testimonials"; ok = false;
      }
    }

    setErrors(next);
    return ok;
  };

  const removeImage      = () => { setPreviewImage(null); setImageFile(null); };
  const removeExisting   = () => setExistingImages([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("type",          type);
      payload.append("name",          name.trim());
      payload.append("designation",   designation);
      payload.append("company",       company);
      payload.append("status",        String(status));
      payload.append("existingImage", existingImages[0] || "");

      // text fields
      payload.append("message", message);
      payload.append("url",     url || "");

      // video fields
      payload.append("videoUrl", videoUrl || "");
      payload.append("quote",    quote    || "");

      if (imageFile) payload.append("image", imageFile);

      if (isEditMode) {
        await updatetestimonialApi(id!, payload);
        toast.success("Testimonial updated");
      } else {
        await add_testimonial_Api(payload);
        toast.success("Testimonial added");
      }

      navigate("/admin-dash/testimonials");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) toast.error("Testimonial already exists");
      else toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex justify-content-between">
          <h4 className="fw-bold">{isEditMode ? "Edit testimonial" : "Add testimonial"}</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/testimonials")}>← Back</button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Loading...</span></div>
          <p className="text-muted mb-0">Loading testimonial...</p>
        </div>
      </div>
    );
  }

  const shownImage = previewImage || (existingImages[0] ? imgSrc(existingImages[0]) : "");

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit testimonial" : "Add testimonial"}</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/testimonials")}>← Back</button>
      </div>

      <div className="row mt-3">

        {/* LEFT */}
        <div className="col-md-9 col-12 p-md-4">

          {/* ── TYPE TOGGLE ── */}
          <div className="mb-4">
            <div className="d-flex gap-2">
{!isEditMode && (
  <div className="mb-4">
    <label className="form-label fw-semibold">Testimonial Type</label>
    <div className="d-flex gap-2">
      <button
        type="button"
        className={`btn ${type === "text" ? "btn-dark" : "btn-outline-dark"}`}
        onClick={() => setType("text")}
      >
        ✏️ Text Testimonial
      </button>
      <button
        type="button"
        className={`btn ${type === "video" ? "btn-dark" : "btn-outline-dark"}`}
        onClick={() => setType("video")}
      >
        ▶️ Video Testimonial
      </button>
    </div>
  </div>
)}

{isEditMode && (
  <div className="mb-4">
    <label className="form-label fw-semibold">Testimonial Type</label>
    <div>
      <span className={`badge fs-6 ${type === "video" ? "bg-danger" : "bg-secondary"}`}>
        {type === "video" ? "▶ Video Testimonial" : "✏️ Text Testimonial"}
      </span>
      <p className="text-muted mt-1 mb-0" style={{ fontSize: "12px" }}>
        Type cannot be changed after creation.
      </p>
    </div>
  </div>
)}
            </div>
          </div>

          {/* ── COMMON FIELDS ── */}
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Name <span className="text-danger">*</span></label>
              <input id="name" className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input className="form-control" value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">Company</label>
            <input className="form-control" value={company} onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp" />
          </div>

          {/* ── TEXT TESTIMONIAL FIELDS ── */}
          {type === "text" && (
            <>
              <div className="mt-3">
                <label className="form-label">URL <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span></label>
                <input id="url" className={`form-control ${errors.url ? "is-invalid" : ""}`}
                  value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                {errors.url && <div className="invalid-feedback">{errors.url}</div>}
              </div>

              <div className="mt-3">
                <label className="form-label">Message <span className="text-danger">*</span></label>
                <textarea id="message" rows={5}
                  className={`form-control ${errors.message ? "is-invalid" : ""}`}
                  value={message} onChange={(e) => setMessage(e.target.value)} />
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>
            </>
          )}

          {/* ── VIDEO TESTIMONIAL FIELDS ── */}
          {type === "video" && (
            <>
              <div className="mt-3">
                <label className="form-label">Video URL <span className="text-danger">*</span></label>
                <input id="videoUrl" type="url"
                  className={`form-control ${errors.videoUrl ? "is-invalid" : ""}`}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                {errors.videoUrl && <div className="invalid-feedback">{errors.videoUrl}</div>}
                <small className="text-muted">YouTube or Vimeo links accepted</small>
              </div>

              <div className="mt-3">
                <label className="form-label">
                  Quote <span className="text-muted" style={{ fontSize: "12px" }}>(short text shown alongside the video)</span>
                </label>
                <textarea rows={3} className="form-control" value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="e.g. Working with Phitany transformed our digital presence..." />
              </div>
            </>
          )}

        </div>

        {/* RIGHT */}
        <div className="col-md-3 col-12 p-md-4 p-2">

          <label className="form-label">Status</label>
          <select className="form-control" value={status ? "true" : "false"}
            onChange={(e) => setStatus(e.target.value === "true")}>
            <option value="true">Active</option>
            <option value="false">Draft</option>
          </select>

          {/* IMAGE / THUMBNAIL */}
          <div className="mt-4">
            <h6>
              {type === "video" ? (
                <>Thumbnail <span className="text-danger">*</span></>
              ) : (
                <>Image <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span></>
              )}
            </h6>
            <p className="text-muted" style={{ fontSize: "12px" }}>
              {type === "video"
                ? "Thumbnail shown before the video plays. Recommended 16:9."
                : "Preferred 300×300px. JPG, PNG, WebP · Max 2 MB."}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              id="imageUpload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageFile(file);
                setPreviewImage(URL.createObjectURL(file));
                e.target.value = "";
              }}
            />

            {/* upload box — only when no image */}
            {!shownImage && (
              <div className={`upload-box text-center p-5 border ${errors.image ? "border-danger" : ""}`}
                style={{ cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                  <p className="text-primary fw-semibold mb-0">Click / Drop file here to upload</p>
                </label>
              </div>
            )}
            {errors.image && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.image}</div>}

            {/* preview + change/remove */}
            {shownImage && (
              <div className="mt-2">
                <img src={shownImage} className="img-thumbnail w-100"
                  alt={type === "video" ? "Thumbnail" : "Photo"} />
                <div className="d-flex gap-2 mt-2">
                  <button type="button" className="btn btn-outline-dark btn-sm"
                    onClick={() => document.getElementById("imageUpload")?.click()}>Change</button>
                  <button type="button" className="btn btn-danger btn-sm"
                    onClick={previewImage ? removeImage : removeExisting}>Remove</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="d-none"
                  id="imageUpload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageFile(file);
                    setPreviewImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 px-md-4">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : isEditMode ? "Update testimonial" : "Add testimonial"}
        </button>
      </div>

    </div>
  );
}

export default Add_testimonial;