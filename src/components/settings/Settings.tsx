import { useEffect, useRef, useState } from "react";
import { getSettingsApi, saveSettingsApi } from "../../services/allAPi";
import { toast } from "react-toastify";
import { imgSrc } from "../../utils/imgSrc";

type SettingsData = {
  email:             string;
  phone:             string;
  address:           string;
  facebook:          string;
  twitter:           string;
  linkedin:          string;
  instagram:         string;
  youtube:           string;
  yearsOfExperience: string;
  projectsCompleted: string;
  clientSatisfaction:string;
  expertTeamMembers: string;
  countriesServed:   string;
  bannerType:        "image" | "video" | "none";
  bannerImage:       string;
  bannerVideoUrl:    string;
};

const EMPTY: SettingsData = {
  email: "", phone: "", address: "",
  facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "",
  yearsOfExperience: "", projectsCompleted: "",
  clientSatisfaction: "", expertTeamMembers: "", countriesServed: "",
  bannerType: "none", bannerImage: "", bannerVideoUrl: "",
};

export default function Settings() {
  const [loading, setLoading]   = useState(false);
  const [formData, setFormData] = useState<SettingsData>(EMPTY);
  const [errors, setErrors]     = useState({ email: "", phone: "" });

  // ── banner state ──────────────────────────────────────────
  const [activeTab, setActiveTab]                     = useState<"image" | "video">("image");
  const [bannerImageFile, setBannerImageFile]         = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview]   = useState("");
  const [bannerVideoUrl, setBannerVideoUrl]           = useState("");
  const [removeBannerImage, setRemoveBannerImage]     = useState(false);
  const [removeBannerVideo, setRemoveBannerVideo]     = useState(false);
  const bannerInputRef                                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSettingsApi();
        if (res?.data?.data) {
          const d = res.data.data as SettingsData;
          setFormData(d);
          // pre-select tab based on saved bannerType
          if (d.bannerType === "video") setActiveTab("video");
          else setActiveTab("image");
          // prefill video url input
          if (d.bannerVideoUrl) setBannerVideoUrl(d.bannerVideoUrl);
        }
      } catch {
        console.log("Failed loading settings");
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "email" || name === "phone") setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = { email: "", phone: "" };
    let isValid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = "Invalid email format"; isValid = false; }
    if (!/^[0-9+\s\-()]+$/.test(formData.phone))             { newErrors.phone = "Invalid phone number";  isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const fd = new FormData();

      // basic fields
      Object.entries(formData).forEach(([key, val]) => {
        if (!["bannerType", "bannerImage", "bannerVideoUrl"].includes(key)) {
          fd.append(key, val as string);
        }
      });

      // ✅ banner — activeTab sets which one displays on frontend
      fd.append("bannerType", activeTab);

      if (removeBannerImage) fd.append("removeBannerImage", "true");
      if (removeBannerVideo) fd.append("removeBannerVideo", "true");
      if (bannerImageFile)   fd.append("bannerImage", bannerImageFile);
      if (bannerVideoUrl.trim()) fd.append("bannerVideoUrl", bannerVideoUrl.trim());

      await saveSettingsApi(fd);
      toast.success("Settings updated successfully");

      // reset banner file state
      setBannerImageFile(null);
      setBannerImagePreview("");
      setRemoveBannerImage(false);
      setRemoveBannerVideo(false);

      // reload to reflect saved data
      const res = await getSettingsApi();
      if (res?.data?.data) {
        const d = res.data.data as SettingsData;
        setFormData(d);
        if (d.bannerVideoUrl) setBannerVideoUrl(d.bannerVideoUrl);
      }

    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-md-4">
      <h4 className="fw-bold text-dark">Settings</h4>

      <div className="card-body mt-3">
        <form noValidate onSubmit={handleSubmit}>

          {/* ── CONTACT ── */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email <span className="text-danger">*</span></label>
              <input name="email" value={formData.email} onChange={handleChange}
                className={`form-control ${errors.email ? "is-invalid" : ""}`} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone <span className="text-danger">*</span></label>
              <input name="phone" value={formData.phone} onChange={handleChange}
                className={`form-control ${errors.phone ? "is-invalid" : ""}`} />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows={3} />
          </div>

          {/* ── SOCIAL ── */}
          <h5 className="mt-3">Social Media Links</h5>
          <div className="row">
            {(["facebook","twitter","linkedin","instagram","youtube"] as const).map((field) => (
              <div className="col-md-6 mb-3" key={field}>
                <label className="form-label" style={{ textTransform: "capitalize" }}>{field}</label>
                <input name={field} value={formData[field]} onChange={handleChange} className="form-control" />
              </div>
            ))}
          </div>

          {/* ── COUNTS ── */}
          <h5 className="mt-3">Counts</h5>
          <div className="row">
            {([
              ["yearsOfExperience",  "Years of Experience", "e.g. 14+"],
              ["projectsCompleted",  "Projects Completed",  "e.g. 460+"],
              ["clientSatisfaction", "Client Satisfaction", "e.g. 95%"],
              ["expertTeamMembers",  "Expert Team Members", "e.g. 50+"],
              ["countriesServed",    "Countries Served",    "e.g. 12+"],
            ] as const).map(([field, label, placeholder]) => (
              <div className="col-md-3 mb-3" key={field}>
                <label className="form-label">{label}</label>
                <input name={field} value={formData[field]} onChange={handleChange}
                  className="form-control" placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* ── BANNER ── */}
          <h5 className="mt-3">Banner</h5>
          <div className="card border-0 shadow-sm p-3 mb-4">

            {/* tab toggle */}
            <div className="d-flex gap-2 mb-3">
              <button type="button"
                className={`btn btn-sm ${activeTab === "image" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setActiveTab("image")}>
                🖼 Image
              </button>
              <button type="button"
                className={`btn btn-sm ${activeTab === "video" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setActiveTab("video")}>
                ▶ Video URL
              </button>
              <small className="text-muted d-flex align-items-center ms-2" style={{ fontSize: "12px" }}>
                Active tab = what shows on frontend
              </small>
            </div>

            {/* ── IMAGE TAB ── */}
            {activeTab === "image" && (
              <div>
                <input ref={bannerInputRef} type="file" accept="image/*" className="d-none"
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setBannerImageFile(f);
                    setBannerImagePreview(URL.createObjectURL(f));
                    setRemoveBannerImage(false);
                    e.target.value = "";
                  }} />

                {/* show preview of new file */}
                {bannerImagePreview && (
                  <div className="mb-2">
                    <img src={bannerImagePreview} alt="New banner"
                      className="img-fluid rounded" style={{ maxHeight: "180px" }} />
                    <div className="d-flex gap-2 mt-2">
                      <button type="button" className="btn btn-sm btn-outline-dark"
                        onClick={() => bannerInputRef.current?.click()}>Change</button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        onClick={() => { setBannerImageFile(null); setBannerImagePreview(""); }}>Remove</button>
                    </div>
                  </div>
                )}

                {/* show existing saved image */}
                {!bannerImagePreview && formData.bannerImage && !removeBannerImage && (
                  <div className="mb-2">
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Current banner image:</p>
                    <img src={imgSrc(formData.bannerImage)} alt="Current banner"
                      className="img-fluid rounded" style={{ maxHeight: "180px" }} />
                    <div className="d-flex gap-2 mt-2">
                      <button type="button" className="btn btn-sm btn-outline-dark"
                        onClick={() => bannerInputRef.current?.click()}>Change</button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        onClick={() => setRemoveBannerImage(true)}>Remove</button>
                    </div>
                  </div>
                )}

                {/* removed indicator */}
                {removeBannerImage && (
                  <div className="alert alert-warning py-2 d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: "13px" }}>Banner image will be removed on save.</span>
                    <button type="button" className="btn btn-sm btn-outline-secondary"
                      onClick={() => setRemoveBannerImage(false)}>Undo</button>
                  </div>
                )}

                {/* upload box — show when no image */}
                {!bannerImagePreview && (!formData.bannerImage || removeBannerImage) && (
                  <div className="upload-box text-center p-4 border" style={{ cursor: "pointer" }}
                    onClick={() => bannerInputRef.current?.click()}>
                    <p className="text-primary fw-semibold mb-0">Click to upload banner image</p>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>JPG, PNG, WebP — Max 5MB</p>
                  </div>
                )}
              </div>
            )}

            {/* ── VIDEO URL TAB ── */}
            {activeTab === "video" && (
              <div>
                <label className="form-label">Video URL</label>
                <input type="url" className="form-control"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={bannerVideoUrl}
                  onChange={(e) => { setBannerVideoUrl(e.target.value); setRemoveBannerVideo(false); }} />

                {/* remove existing video */}
                {formData.bannerVideoUrl && !removeBannerVideo && (
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted" style={{ wordBreak: "break-all" }}>
                      Saved: {formData.bannerVideoUrl}
                    </small>
                    <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => { setRemoveBannerVideo(true); setBannerVideoUrl(""); }}>
                      Remove
                    </button>
                  </div>
                )}

                {removeBannerVideo && (
                  <div className="alert alert-warning py-2 d-flex justify-content-between align-items-center mt-2">
                    <span style={{ fontSize: "13px" }}>Video URL will be removed on save.</span>
                    <button type="button" className="btn btn-sm btn-outline-secondary"
                      onClick={() => { setRemoveBannerVideo(false); setBannerVideoUrl(formData.bannerVideoUrl); }}>Undo</button>
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}