// components/solutions/Add_solution.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
  add_solution_Api,
  getSolutionByIdApi,
  updateSolutionApi,
  getAllCaseStudiesApi, // already used by Add_caseStudy.tsx
} from "../../services/allAPi";
import type { KeyPointItem } from "../../types/solutionTypes";
import { imgSrc } from "../../utils/imgSrc";

type FormErrors = {
  name: string;
  image: string;
  shortDescription: string;
  keyPoints: string;
};
const emptyErrors: FormErrors = { name: "", image: "", shortDescription: "", keyPoints: "" };

export default function Add_solution() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageRef = useRef<HTMLInputElement | null>(null);

  const [keyPoints, setKeyPoints] = useState<KeyPointItem[]>([]);
  const [keyPointErrors, setKeyPointErrors] = useState<Record<number, string>>({});

  const [caseStudyOptions, setCaseStudyOptions] = useState<{ value: string; label: string }[]>([]);
  const [relatedCaseStudies, setRelatedCaseStudies] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);

  useEffect(() => {
    const load = async () => {
      try {
        const cs = await getAllCaseStudiesApi();
        setCaseStudyOptions((cs.data.data ?? []).map((c: any) => ({ value: c._id, label: c.title })));
      } catch {
        toast.error("Failed to load case studies");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchSolution = async () => {
      try {
        const res = await getSolutionByIdApi(id);
        const s = res.data.data ?? (res.data as any);

        setName(s.name ?? "");
        setShortDescription(s.shortDescription ?? "");
        setDisplayOrder(s.displayOrder ?? 0);
        setIsActive(s.isActive);
        setExistingImage(s.image ?? "");
        setKeyPoints((s.keyPoints ?? []).map((kp: any) => ({ icon: kp.icon, text: kp.text })));
        setRelatedCaseStudies((s.relatedCaseStudies ?? []).map((c: any) => c._id));
      } catch {
        toast.error("Failed to load solution");
        navigate("/admin-dash/solution");
      } finally {
        setLoadingData(false);
      }
    };

    fetchSolution();
  }, [id, navigate]);

  const pickImage = (file: File | undefined | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, image: "Only JPG, PNG, or WebP images are accepted" }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Image must be under 2 MB" }));
      return;
    }
    setErrors((p) => ({ ...p, image: "" }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── key point helpers ──────────────────────────────────
  const addKeyPoint = () => setKeyPoints((prev) => [...prev, { icon: "", text: "" }]);
  const removeKeyPoint = (i: number) => setKeyPoints((prev) => prev.filter((_, idx) => idx !== i));
  const updateKeyPointText = (i: number, text: string) =>
    setKeyPoints((prev) => prev.map((kp, idx) => (idx === i ? { ...kp, text } : kp)));
  const pickKeyPointIcon = (i: number, file: File | undefined | null) => {
    if (!file) return;
    setKeyPoints((prev) =>
      prev.map((kp, idx) => (idx === i ? { ...kp, file, previewUrl: URL.createObjectURL(file) } : kp))
    );
  };

  const scrollToFirstError = (newErrors: FormErrors) => {
    const firstKey = Object.keys(newErrors).find((k) => newErrors[k as keyof FormErrors] !== "");
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => (el as HTMLElement).focus?.(), 300);
    }
  };

  const scrollToFirstKeyPointError = (errs: Record<number, string>) => {
    const firstIndex = Object.keys(errs).map(Number).sort((a, b) => a - b)[0];
    if (firstIndex === undefined) return;
    const el = document.getElementById(`keypoint-${firstIndex}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validateForm = () => {
    const next = { ...emptyErrors };
    let ok = true;

    if (!name.trim()) { next.name = "Name is required"; ok = false; }

    // a key point that's been started must be complete — no half-filled
    // points saved silently (text with no icon, or icon with no text)
    let kpOk = true;
    const kpErrors: Record<number, string> = {};
    keyPoints.forEach((kp, i) => {
      const hasText = kp.text.trim().length > 0;
      const hasIcon = !!kp.icon || !!kp.file;
      if (hasText !== hasIcon) {
        kpErrors[i] = hasText ? "Icon is required" : "Text is required";
        kpOk = false;
      }
    });
    setKeyPointErrors(kpErrors);

    setErrors(next);

    if (!ok) {
      scrollToFirstError(next);
    } else if (!kpOk) {
      scrollToFirstKeyPointError(kpErrors);
    }

    return ok && kpOk;
  };

  const handleSubmit = async () => {
     if (loading) return;
    if (!validateForm()) return;

    const iconFilesInOrder: File[] = [];
    const keyPointsForPayload = keyPoints.map((kp) => {
      if (kp.icon) return { icon: kp.icon, text: kp.text };
      if (kp.file) iconFilesInOrder.push(kp.file);
      return { icon: "", text: kp.text };
    });

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("shortDescription", shortDescription);
    fd.append("keyPoints", JSON.stringify(keyPointsForPayload));
    fd.append("relatedCaseStudies", JSON.stringify(relatedCaseStudies));
    fd.append("displayOrder", String(displayOrder));
    fd.append("status", String(isActive));
    if (imageFile) fd.append("image", imageFile);
    for (const f of iconFilesInOrder) fd.append("keyPointIcons", f);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateSolutionApi(id, fd);
        toast.success("Solution updated");
      } else {
        await add_solution_Api(fd);
        toast.success("Solution added");
      }
      navigate("/admin-dash/solution");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Loading...</span></div>
          <p className="text-muted mb-0">Loading solution...</p>
        </div>
      </div>
    );
  }

  const shownImage = imagePreview || (existingImage ? imgSrc(existingImage) : "");

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Solution" : "Add Solution"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/solution")}>
          ← Back to Solutions
        </button>
      </div>

      <div className="p-md-2 mb-4">
        <div className="row">
          <div className="col-md-6">
            <label htmlFor="name" className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">Display Order</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* ── SHORT DESCRIPTION ── */}
        <label htmlFor="shortDescription" className="form-label mt-3">Short Description</label>
        <textarea
          id="shortDescription"
          className={`form-control ${errors.shortDescription ? "is-invalid" : ""}`}
          rows={3}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
        {errors.shortDescription && <div className="invalid-feedback d-block">{errors.shortDescription}</div>}

        {/* ── HERO IMAGE ── */}
        <div className="mt-3">
          <h6 id="image">Hero Image</h6>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }}
          />
          {shownImage ? (
            <div className="d-flex align-items-center gap-3">
              <img src={shownImage} alt="Solution" className="img-thumbnail" style={{ width: "180px", height: "120px", objectFit: "cover" }} />
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => imageRef.current?.click()}>Change image</button>
            </div>
          ) : (
            <div
              className={`upload-box text-center p-5 border ${errors.image ? "border-danger" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => imageRef.current?.click()}
            >
              <p className="mb-1">Click to select image</p><h4>+</h4>
            </div>
          )}
          {errors.image && <div className="text-danger mt-1">{errors.image}</div>}
        </div>

        {/* ── KEY POINTS ── */}
        <div id="keyPoints" className="card mt-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light d-flex justify-content-between align-items-center">
            <span>Key Points</span>
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={addKeyPoint}>+ Add Key Point</button>
          </div>
          <div className="card-body">
            {errors.keyPoints && <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>{errors.keyPoints}</div>}

            {keyPoints.map((kp, i) => {
              const kpError = keyPointErrors[i];
              const shownIcon = kp.previewUrl || (kp.icon ? imgSrc(kp.icon) : "");
              return (
                <div key={i} id={`keypoint-${i}`} className={`row align-items-center mb-3 g-2 p-2 ${kpError ? "border border-danger rounded" : ""}`}>
                  <div className="col-md-2">
                    <input
                      type="file"
                      accept="image/*"
                      id={`keypoint-icon-input-${i}`}
                      className="d-none"
                      onChange={(e) => { pickKeyPointIcon(i, e.target.files?.[0]); e.target.value = ""; }}
                    />
                    {shownIcon ? (
                      <img
                        src={shownIcon}
                        alt="icon"
                        style={{ width: "44px", height: "44px", objectFit: "contain", cursor: "pointer" }}
                        onClick={() => document.getElementById(`keypoint-icon-input-${i}`)?.click()}
                      />
                    ) : (
                      <button
                        type="button"
                        className={`btn btn-sm ${kpError ? "btn-outline-danger" : "btn-outline-secondary"}`}
                        onClick={() => document.getElementById(`keypoint-icon-input-${i}`)?.click()}
                      >
                        + Icon
                      </button>
                    )}
                  </div>
                  <div className="col-md-8">
                    <input
                      className="form-control"
                      placeholder="e.g. Custom-built, scalable architecture"
                      value={kp.text}
                      onChange={(e) => updateKeyPointText(i, e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeKeyPoint(i)}>Remove</button>
                  </div>
                  {kpError && <div className="text-danger" style={{ fontSize: "12px" }}>{kpError}</div>}
                </div>
              );
            })}

            {keyPoints.length === 0 && (
              <p className="text-muted" style={{ fontSize: "13px" }}>No key points yet — click &quot;+ Add Key Point&quot; to add one.</p>
            )}
          </div>
        </div>

        {/* ── RELATED CASE STUDIES ── */}
        <div className="card mt-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Related Case Studies</div>
          <div className="card-body">
            <Select
              isMulti
              options={caseStudyOptions}
              value={caseStudyOptions.filter((o) => relatedCaseStudies.includes(o.value))}
              onChange={(v) => setRelatedCaseStudies(v.map((o) => o.value))}
              placeholder="Select related case studies"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Solution" : "Add Solution"}
          </button>
          {isEditMode && (
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/admin-dash/solution")} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}