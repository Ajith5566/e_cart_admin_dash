/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { getSettingsApi, saveSettingsApi } from "../../services/allAPi";
import { toast } from "react-toastify";
import { imgSrc } from "../../utils/imgSrc";

type BannerType = "image" | "video" | "none";

type SettingsData = {
    email: string;
    phone: string;
    address: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    yearsOfExperience: string;
    projectsCompleted: string;
    clientSatisfaction: string;
    expertTeamMembers: string;
    countriesServed: string;
    bannerType: BannerType;
    bannerImage: string;
    bannerVideoUrl: string;
};

const EMPTY: SettingsData = {
    email: "", phone: "", address: "",
    facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "",
    yearsOfExperience: "", projectsCompleted: "",
    clientSatisfaction: "", expertTeamMembers: "", countriesServed: "",
    bannerType: "none", bannerImage: "", bannerVideoUrl: "",
};

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SettingsData>(EMPTY);
    const [errors, setErrors] = useState({ email: "", phone: "" });

    // ── banner state ──────────────────────────────────────────
    const [bannerMode, setBannerMode] = useState<"image" | "video">("image");
    const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
    const [bannerImagePreview, setBannerImagePreview] = useState("");
    const [bannerVideoUrl, setBannerVideoUrl] = useState("");
    const [removeBanner, setRemoveBanner] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getSettingsApi();
                if (res?.data?.data) setFormData(res.data.data as SettingsData);
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
        if (!/^[0-9+\s\-()]+$/.test(formData.phone)) { newErrors.phone = "Invalid phone number"; isValid = false; }
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

            // ✅ banner — always send all, no else
            if (removeBanner) fd.append("removeBanner", "true");
            if (bannerImageFile) fd.append("bannerImage", bannerImageFile);
            if (bannerVideoUrl.trim()) fd.append("bannerVideoUrl", bannerVideoUrl.trim());

            await saveSettingsApi(fd);
            toast.success("Settings updated successfully");

            // reset banner state
            setBannerImageFile(null);
            setBannerImagePreview("");
            setBannerVideoUrl("");
            setRemoveBanner(false);

            // reload to reflect saved banner
            const res = await getSettingsApi();
            if (res?.data?.data) setFormData(res.data.data);

        } catch {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };
    const currentBannerType = removeBanner ? "none" : (formData.bannerType ?? "none");

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
                        <label className="form-label">Address <span className="text-danger">*</span></label>
                        <textarea name="address" value={formData.address} onChange={handleChange} className="form-control w-md-50" />
                    </div>

                    {/* ── SOCIAL ── */}
                    <h5 className="mt-3">Social Media Links</h5>
                    <div className="row">
                        {(["facebook", "twitter", "linkedin", "instagram", "youtube"] as const).map((field) => (
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
                            ["yearsOfExperience", "Years of Experience", "e.g. 14+"],
                            ["projectsCompleted", "Projects Completed", "e.g. 460+"],
                            ["clientSatisfaction", "Client Satisfaction", "e.g. 95%"],
                            ["expertTeamMembers", "Expert Team Members", "e.g. 50+"],
                            ["countriesServed", "Countries Served", "e.g. 12+"],
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

                        {/* show current banner */}

                        {currentBannerType === "image" && formData.bannerImage && !removeBanner && (
                            <div className="mb-3">
                                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Current banner image:</p>
                                <img src={imgSrc(formData.bannerImage)} alt="Banner"
                                    className="img-fluid rounded" style={{ maxHeight: "180px" }} />
                                <div className="mt-2">
                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                            setRemoveBanner(true);  // ✅ mark for removal
                                            setBannerMode("video"); // ✅ immediately show video input
                                        }}>
                                        Remove & Switch to Video URL
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-secondary ms-2"
                                        onClick={() => setRemoveBanner(true)}>
                                        Remove Only
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentBannerType === "video" && formData.bannerVideoUrl && !removeBanner && (
                            <div className="mb-3">
                                <p className="text-muted mb-1" style={{ fontSize: "13px" }}>Current video URL:</p>
                                <p className="mb-2" style={{ fontSize: "13px", wordBreak: "break-all" }}>
                                    {formData.bannerVideoUrl}
                                </p>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                            setRemoveBanner(true);  // ✅ mark for removal
                                            setBannerMode("image"); // ✅ immediately show image input
                                        }}>
                                        Remove & Switch to Image
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setRemoveBanner(true)}>
                                        Remove Only
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* show new banner input if removeBanner is pending */}
                        {removeBanner && (
                            <>
                                <div className="alert alert-warning py-2 d-flex justify-content-between align-items-center mb-3">
                                    <span style={{ fontSize: "13px" }}>Current banner will be replaced on save.</span>
                                    <button type="button" className="btn btn-sm btn-outline-secondary"
                                        onClick={() => { setRemoveBanner(false); setBannerImageFile(null); setBannerImagePreview(""); setBannerVideoUrl(""); }}>
                                        Undo
                                    </button>
                                </div>

                                {/* toggle between image and video */}
                                <div className="d-flex gap-2 mb-3">
                                    <button type="button"
                                        className={`btn btn-sm ${bannerMode === "image" ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={() => { setBannerMode("image"); setBannerVideoUrl(""); }}>
                                        🖼 Image
                                    </button>
                                    <button type="button"
                                        className={`btn btn-sm ${bannerMode === "video" ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={() => { setBannerMode("video"); setBannerImageFile(null); setBannerImagePreview(""); }}>
                                        ▶ Video URL
                                    </button>
                                </div>

                                {bannerMode === "image" && (
                                    <div>
                                        <input ref={bannerInputRef} type="file" accept="image/*" className="d-none"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                setBannerImageFile(f);
                                                setBannerImagePreview(URL.createObjectURL(f));
                                                e.target.value = "";
                                            }} />
                                        {bannerImagePreview ? (
                                            <div>
                                                <img src={bannerImagePreview} alt="Preview"
                                                    className="img-fluid rounded mb-2" style={{ maxHeight: "180px" }} />
                                                <div className="d-flex gap-2">
                                                    <button type="button" className="btn btn-sm btn-outline-dark"
                                                        onClick={() => bannerInputRef.current?.click()}>Change</button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => { setBannerImageFile(null); setBannerImagePreview(""); }}>Remove</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="upload-box text-center p-4 border" style={{ cursor: "pointer" }}
                                                onClick={() => bannerInputRef.current?.click()}>
                                                <p className="text-primary fw-semibold mb-0">Click to upload banner image</p>
                                                <p className="text-muted mb-0" style={{ fontSize: "12px" }}>JPG, PNG, WebP — Max 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {bannerMode === "video" && (
                                    <input type="url" className="form-control"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={bannerVideoUrl}
                                        onChange={(e) => setBannerVideoUrl(e.target.value)} />
                                )}
                            </>
                        )}
                        {/* add new banner — only if none set */}
                        {currentBannerType === "none" && !removeBanner && (
                            <div>
                                {/* type toggle */}
                                <div className="d-flex gap-2 mb-3">
                                    <button type="button"
                                        className={`btn btn-sm ${bannerMode === "image" ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={() => { setBannerMode("image"); setBannerVideoUrl(""); }}>
                                        🖼 Image
                                    </button>
                                    <button type="button"
                                        className={`btn btn-sm ${bannerMode === "video" ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={() => { setBannerMode("video"); setBannerImageFile(null); setBannerImagePreview(""); }}>
                                        ▶ Video URL
                                    </button>
                                </div>

                                {bannerMode === "image" && (
                                    <div>
                                        <input ref={bannerInputRef} type="file" accept="image/*" className="d-none"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                setBannerImageFile(f);
                                                setBannerImagePreview(URL.createObjectURL(f));
                                                e.target.value = "";
                                            }} />
                                        {bannerImagePreview ? (
                                            <div>
                                                <img src={bannerImagePreview} alt="Preview"
                                                    className="img-fluid rounded mb-2" style={{ maxHeight: "180px" }} />
                                                <div className="d-flex gap-2">
                                                    <button type="button" className="btn btn-sm btn-outline-dark"
                                                        onClick={() => bannerInputRef.current?.click()}>Change</button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => { setBannerImageFile(null); setBannerImagePreview(""); }}>Remove</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="upload-box text-center p-4 border" style={{ cursor: "pointer" }}
                                                onClick={() => bannerInputRef.current?.click()}>
                                                <p className="text-primary fw-semibold mb-0">Click to upload banner image</p>
                                                <p className="text-muted mb-0" style={{ fontSize: "12px" }}>JPG, PNG, WebP — Max 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {bannerMode === "video" && (
                                    <input type="url" className="form-control"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={bannerVideoUrl}
                                        onChange={(e) => setBannerVideoUrl(e.target.value)} />
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