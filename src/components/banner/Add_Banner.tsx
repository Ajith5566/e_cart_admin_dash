/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  add_banner_Api,
  getbannerbyIdApi,
  updatebannerApi,
} from "../../services/allAPi";
import type { BannerResponse, BannerTypes } from "../../types/bannerTypes";
// ✅ resolves "/uploads/banners/..." → "http://localhost:4000/uploads/banners/..."
import { imgSrc } from "../../utils/imgSrc";

function Add_banner() {
  const [loading, setLoading] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewMobile, setpreviewMobileImage] = useState<string | null>(null);
  const [existingMobileImages, setMobileExistingImages] = useState<string[]>([]);

  const [loadingData, setLoadingData] = useState(!!id);

  const [formData, setFormData] = useState<BannerTypes>({
    title: "",
    sub_title: "",
    button_text: "",
    url: "",
    status: true,
    banner_image: null,
    mobile_image: null,
  });

  const [errors, setErrors] = useState({
    name: "", mobile_image: "", banner_image: "", url: ""
  });

  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchBanner = async () => {
      try {
        const res = await getbannerbyIdApi(id);
        const banner: BannerResponse = res.data.data ?? res.data;

        setFormData({
          title:       banner.title,
          sub_title:   banner.sub_title   || "",
          url:         banner.url         || "",
          button_text: banner.button_text || "",
          status:      banner.isActive,
          banner_image: null,
          mobile_image: null,
        });

        if (banner.banner_image) setExistingImages([banner.banner_image]);
        if (banner.mobile_image) setMobileExistingImages([banner.mobile_image]);

      } catch {
        toast.error("Failed to load banner");
        navigate("/admin-dash/banner");
      } finally {
        setLoadingData(false);
      }
    };

    fetchBanner();
  }, [id]);

  const validateForm = () => {
    const newErrors = { name: "", banner_image: "", mobile_image: "", url: "" };
    let isValid = true;
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;

    if (!formData.title.trim()) {
      newErrors.name = "Title is required";
      isValid = false;
    }

    if (!formData.banner_image && existingImages.length === 0) {
      newErrors.banner_image = "Banner image required";
      isValid = false;
    }

    if (!formData.mobile_image && existingMobileImages.length === 0) {
      newErrors.mobile_image = "Mobile image required";
      isValid = false;
    }

    if (formData.url.trim() && !urlRegex.test(formData.url.trim())) {
      newErrors.url = "Please enter a valid URL";
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

  const removeBannerImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, banner_image: null }));
  };

  const removeMobileImage = () => {
    setpreviewMobileImage(null);
    setFormData((prev) => ({ ...prev, mobile_image: null }));
  };

  const removeExistingImage = () => setExistingImages([]);
  const removeExistingMobileImage = () => setMobileExistingImages([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("title",               formData.title.trim());
      payload.append("sub_title",           formData.sub_title);
      payload.append("button_text",         formData.button_text);
      payload.append("url",                 formData.url || "");
      payload.append("status",              String(formData.status));
      payload.append("existingImage",       existingImages[0] || "");
      payload.append("existingMobileImage", existingMobileImages[0] || "");

      if (formData.banner_image) payload.append("banner_image", formData.banner_image);
      if (formData.mobile_image) payload.append("mobile_image", formData.mobile_image);

      if (isEditMode) {
        await updatebannerApi(id!, payload);
        toast.success("Banner updated");
      } else {
        await add_banner_Api(payload);
        toast.success("Banner added");
      }

      navigate("/admin-dash/banner");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("Banner already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-3">
        <div className="d-flex justify-content-between">
          <h4 className="fw-bold">{isEditMode ? "Edit banner" : "Add banner"}</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/banner")}>
            ← Back to banners
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading banner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">

      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit banner" : "Add banner"}</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/banner")}>
          ← Back to banners
        </button>
      </div>

      <div className="row mt-2">

        {/* LEFT */}
        <div className="col-md-9 col-12 p-4">

          <label className="form-label">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}

          <label className="form-label mt-3">Sub Title</label>
          <input
            id="sub-title"
            className="form-control"
            value={formData.sub_title}
            onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
          />

          <div className="row mt-1">
            <div className="col-md-6">
              <label className="form-label">Button Text</label>
              <input
                id="button-text"
                type="text"
                className="form-control"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">URL</label>
              <input
                id="url"
                type="text"
                className={`form-control ${errors.url ? "is-invalid" : ""}`}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              {errors.url && <div className="invalid-feedback">{errors.url}</div>}
            </div>
          </div>

          <div className="mt-5">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update banner" : "Add banner"}
            </button>
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

          {/* BANNER IMAGE */}
          <div className="mt-4">
            <h6>Banner Image <span className="text-danger">*</span></h6>
            <p className="font_small text-justify">
              Preferred dimension is 1920px x 720px.
              Allowed file types: jpg, jpeg, png, webp.
              Maximum file size: 2 MB.
            </p>

            {/* show upload box only when no image is chosen yet */}
            {!previewImage && existingImages.length === 0 && (
              <div className="upload-box text-center p-5 border">
                <input
                  ref={bannerInputRef}
                  type="file"
                  className="d-none"
                  id="bannerUpload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, banner_image: file }));
                    setPreviewImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
                <label htmlFor="bannerUpload" style={{ cursor: "pointer" }}>
                  <p className="text-primary fw-semibold mb-0">
                    Click / Drop file here to upload
                  </p>
                </label>
              </div>
            )}

            {errors.banner_image && (
              <div className="invalid-feedback d-block">{errors.banner_image}</div>
            )}

            {/* ✅ FIXED: imgSrc() prefixes server origin for DB paths */}
            {(previewImage || existingImages.length > 0) && (
              <div className="mt-3">
                <img
                  src={previewImage || imgSrc(existingImages[0])}
                  className="img-thumbnail w-100"
                  alt="Banner preview"
                />
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => document.getElementById("bannerUpload")?.click()}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={previewImage ? removeBannerImage : removeExistingImage}
                  >
                    Remove
                  </button>
                </div>
                {/* hidden input for "Change" button */}
                <input
                  ref={bannerInputRef}
                  type="file"
                  className="d-none"
                  id="bannerUpload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, banner_image: file }));
                    setPreviewImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </div>
            )}
          </div>

          {/* MOBILE IMAGE */}
          <div className="mt-4">
            <h6>Mobile Image <span className="text-danger">*</span></h6>
            <p className="font_small text-justify">
              Preferred dimension is 600px x 350px.
              Allowed file types: jpg, jpeg, png, webp.
              Maximum file size: 2 MB.
            </p>

            {!previewMobile && existingMobileImages.length === 0 && (
              <div className="upload-box text-center p-5 border">
                <input
                  ref={mobileInputRef}
                  type="file"
                  className="d-none"
                  id="mobileUpload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, mobile_image: file }));
                    setpreviewMobileImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
                <label htmlFor="mobileUpload" style={{ cursor: "pointer" }}>
                  <p className="text-primary fw-semibold mb-0">
                    Click / Drop file here to upload
                  </p>
                </label>
              </div>
            )}

            {errors.mobile_image && (
              <div className="invalid-feedback d-block">{errors.mobile_image}</div>
            )}

            {/* ✅ FIXED: imgSrc() prefixes server origin for DB paths */}
            {(previewMobile || existingMobileImages.length > 0) && (
              <div className="mt-3">
                <img
                  src={previewMobile || imgSrc(existingMobileImages[0])}
                  className="img-thumbnail w-100"
                  alt="Mobile preview"
                />
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => document.getElementById("mobileUpload")?.click()}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={previewMobile ? removeMobileImage : removeExistingMobileImage}
                  >
                    Remove
                  </button>
                </div>
                {/* hidden input for "Change" button */}
                <input
                  ref={mobileInputRef}
                  type="file"
                  className="d-none"
                  id="mobileUpload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, mobile_image: file }));
                    setpreviewMobileImage(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default Add_banner;