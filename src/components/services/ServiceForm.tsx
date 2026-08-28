// components/caseStudy/Add_service.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { lazy, Suspense } from "react"; // add lazy, Suspense to your existing React import
import "react-quill-new/dist/quill.snow.css";
import {
  addServiceApi,
  getServiceByIdApi,
  updateServiceApi,
  getAllServicesApi,
  getAllTechnologiesApi,
  getAllIndustriesApi,
} from "../../services/allAPi";
import type { ServiceProcessItem, ServiceTechnologyItem } from "../../types/serviceTypes";
import type { MetaFields } from "../../types/types";
import slugify from "slugify";
import { imgSrc } from "../../utils/imgSrc";
import SeoPreview from "../seo/Seo";
import { cleanQuill, Modules } from "../quillmodule";


const ReactQuill = lazy(() => import("react-quill-new"));



type ProcessError = { title: string; description: string };
type TechnologyError = { technology: string; description: string };

type FormErrors = {
  title: string;
  description: string;
  shortDescription: string;
  introTitle: string;
  introDescription: string;
  process: ProcessError[];
  technologies: TechnologyError[];
  industry: string;
};

const emptyErrors: FormErrors = {
  title: "",
  description: "",
  shortDescription: "",
  introTitle: "",
  introDescription: "",
  process: [],
  technologies: [],
  industry: ""
};

const emptyMeta: MetaFields = {
  slug: "",
  meta_title: "",
  meta_keywords: [],
  meta_description: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: null,
  twitter_title: "",
  twitter_description: "",
  twitter_image: null,
  schema_markup: "",
  allow_indexing: true,
  allow_following: true,
  include_sitemap: true,
  sitemap_priority: "0.5",
  change_frequency: "daily",
};

const SEO_BASE_URL = "https://mern-admin-sable.vercel.app/";

export default function Add_service() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [parentService, setParentService] = useState<string | null>(null);
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([]);

  // top-level fields
  const [description, setDescription] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [existingBanner, setExistingBanner] = useState("");
  const bannerRef = useRef<HTMLInputElement | null>(null);

  // leaf fields
  const [shortDescription, setShortDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [introTitle, setIntroTitle] = useState("");
  const [introDescription, setIntroDescription] = useState("");
  const [process, setProcess] = useState<ServiceProcessItem[]>([]);
  const [technologies, setTechnologies] = useState<ServiceTechnologyItem[]>([]);
  const [technologyOptions, setTechnologyOptions] = useState<{ value: string; label: string }[]>([]);

  const [industries, setIndustries] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<{ value: string; label: string }[]>([]);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [existingHero, setExistingHero] = useState("");
  const heroRef = useRef<HTMLInputElement | null>(null);

  // ── SEO / Meta ──
  const [meta, setMeta] = useState<MetaFields>(emptyMeta);
  const [slugTouched, setSlugTouched] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  const [metaTitleTouched, setMetaTitleTouched] = useState(false);
  const [metaDescriptionTouched, setMetaDescriptionTouched] = useState(false);

  const [displayOrder, setDisplayOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);

  const isTopLevel = !parentService;

  useEffect(() => {
    const load = async () => {
      try {
        const [ind] = await Promise.all([
          getAllIndustriesApi(),
        ]);
        setIndustryOptions((ind.data.data ?? []).map((i: any) => ({ value: i._id, label: i.name })));
      } catch {
        toast.error("Failed to load options");
      }
    };
    load();
  }, [id]);


  // slug follows the title until the admin edits it in the SEO panel.
  // in edit mode it never auto-changes — retitling shouldn't move a live URL.
  useEffect(() => {
    const autoDescription = isTopLevel ? description : shortDescription;

    setMeta((prev) => ({
      ...prev,
      slug: slugTouched || isEditMode
        ? prev.slug
        : (title.trim() ? slugify(title, { lower: true, strict: true, trim: true }) : ""),
      meta_title: metaTitleTouched ? prev.meta_title : title,
      meta_description: metaDescriptionTouched ? prev.meta_description : autoDescription,
    }));
  }, [
    title, description, shortDescription, isTopLevel,
    slugTouched, metaTitleTouched, metaDescriptionTouched, isEditMode,
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [svc, tech] = await Promise.all([
          getAllServicesApi({ topLevelOnly: true }),
          getAllTechnologiesApi(),
        ]);
        setParentOptions(
          (svc.data.data ?? [])
            .filter((s: any) => s._id !== id)
            .map((s: any) => ({ value: s._id, label: s.title }))
        );
        setTechnologyOptions((tech.data.data ?? []).map((t: any) => ({ value: t._id, label: t.name })));
      } catch {
        toast.error("Failed to load options");
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchService = async () => {
      try {
        const res = await getServiceByIdApi(id);
        const s = res.data.data ?? (res.data as any);

        setTitle(s.title ?? "");
        setParentService(s.parentService?._id ?? null);
        setDescription(s.description ?? "");
        setBullets(s.bullets ?? []);
        setExistingBanner(s.bannerImage ?? "");
        setShortDescription(s.shortDescription ?? "");
        setTagline(s.tagline ?? "");
        setIntroTitle(s.introTitle ?? "");
        setIntroDescription(s.introDescription ?? "");
        setProcess(s.process ?? []);
         setIndustries((s.industries ?? []).map((s: any) => s._id));
        setTechnologies((s.technologies ?? []).map((t: any) => ({
          technology: t.technology?._id ?? t.technology,
          description: t.description ?? "",
        })));
        setExistingHero(s.heroImage ?? "");
        setDisplayOrder(s.displayOrder ?? 0);
        setFeatured(s.featured ?? false);
        setStatus(s.isActive);

        // getServiceById returns { ...service, meta }
        const m = s.meta ?? {};
        const loadedSlug = m.slug || s.slug || "";
        setMeta({
          ...emptyMeta,
          ...m,
          slug: loadedSlug,
          meta_keywords: m.meta_keywords ?? [],
          og_image: m.og_image || null,
          twitter_image: m.twitter_image || null,
        });
        setOriginalSlug(loadedSlug);
        setSlugTouched(true);
        if (m.meta_title) setMetaTitleTouched(true);
        if (m.meta_description) setMetaDescriptionTouched(true);
      } catch {
        toast.error("Failed to load service");
        navigate("/admin-dash/service");
      } finally {
        setLoadingData(false);
      }
    };

    fetchService();
  }, [id]);

  // ── bullets helpers ──────────────────────────────────
  const addBullet = () => setBullets((prev) => [...prev, ""]);
  const updateBullet = (i: number, val: string) => setBullets((prev) => prev.map((b, idx) => (idx === i ? val : b)));
  const removeBullet = (i: number) => setBullets((prev) => prev.filter((_, idx) => idx !== i));

  // ── process helpers ──────────────────────────────────
  const addProcessStep = () => setProcess((prev) => [...prev, { title: "", description: "" }]);

  const updateProcessStep = (i: number, field: keyof ServiceProcessItem, val: string) => {
    setProcess((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
    // clear the error for the field being edited
    setErrors((prev) => ({
      ...prev,
      process: prev.process.map((e, idx) => (idx === i ? { ...e, [field]: "" } : e)),
    }));
  };

  const removeProcessStep = (i: number) => {
    setProcess((prev) => prev.filter((_, idx) => idx !== i));
    // keep error indices aligned with the rows
    setErrors((prev) => ({ ...prev, process: prev.process.filter((_, idx) => idx !== i) }));
  };

  // ── technologies helpers ──────────────────────────────
  const addTechnology = () => setTechnologies((prev) => [...prev, { technology: "", description: "" }]);

  const updateTechnology = (i: number, field: keyof ServiceTechnologyItem, val: string) => {
    setTechnologies((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));
    setErrors((prev) => ({
      ...prev,
      technologies: prev.technologies.map((e, idx) => (idx === i ? { ...e, [field]: "" } : e)),
    }));
  };

  const removeTechnology = (i: number) => {
    setTechnologies((prev) => prev.filter((_, idx) => idx !== i));
    setErrors((prev) => ({ ...prev, technologies: prev.technologies.filter((_, idx) => idx !== i) }));
  };

  const pickImage = (
    file: File | undefined | null,
    setFile: (f: File | null) => void,
    setPreview: (s: string) => void
  ) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, or WebP images are accepted"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const scrollToId = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => (el as HTMLElement).focus?.(), 300);
  };

  const validateForm = () => {
    const next: FormErrors = { ...emptyErrors, process: [], technologies: [] };
    let firstErrorId = "";
    const flag = (elementId: string) => { if (!firstErrorId) firstErrorId = elementId; };

    if (!title.trim()) { next.title = "Service title is required"; flag("title"); }
   if (industries.length === 0) {
  next.industry = "Industry is required";
  flag("industry");
}

    if (isTopLevel) {
      if (!description.trim()) {
        next.description = "Description is required for a top-level service";
        flag("description");
      }
    } else {
      if (!shortDescription.trim()) { next.shortDescription = "Short description is required"; flag("shortDescription"); }
      if (!introTitle.trim()) { next.introTitle = "Intro title is required"; flag("introTitle"); }
      if (!introDescription.trim()) { next.introDescription = "Intro description is required"; flag("introDescription"); }

      // ── process rows ──
      next.process = process.map(() => ({ title: "", description: "" }));
      process.forEach((p, i) => {
        if (!p.title.trim()) {
          next.process[i].title = "Step title is required";
          flag(`process-${i}-title`);
        }
        if (!p.description.trim()) {
          next.process[i].description = "Step description is required";
          flag(`process-${i}-description`);
        }
      });

      // ── technology rows ──
      next.technologies = technologies.map(() => ({ technology: "", description: "" }));
      const seen = new Set<string>();
      technologies.forEach((t, i) => {
        if (!t.technology) {
          next.technologies[i].technology = "Select a technology";
          flag(`technology-${i}`);
        } else if (seen.has(t.technology)) {
          next.technologies[i].technology = "This technology is already added";
          flag(`technology-${i}`);
        } else {
          seen.add(t.technology);
        }
        if (!t.description.trim()) {
          next.technologies[i].description = "Description is required";
          flag(`technology-${i}-description`);
        }
      });
    }

    setErrors(next);
    if (firstErrorId) scrollToId(firstErrorId);
    return !firstErrorId;
  };

  // slug lives inside the collapsed SEO panel, so it's reported with a toast
  // instead of an inline field error the admin can't see
  const resolveSlug = () => {
    const raw = (meta.slug || slugify(title, { lower: true, strict: true, trim: true })).trim().toLowerCase();
    if (!raw) {
      toast.error("Slug is required — open the SEO section to set it");
      return null;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw)) {
      toast.error("Slug can only contain lowercase letters, numbers and hyphens");
      return null;
    }
    return raw;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const finalSlug = resolveSlug();
    if (!finalSlug) return;

    if (isEditMode && originalSlug && finalSlug !== originalSlug) {
      const ok = window.confirm(
        `The URL will change from "${originalSlug}" to "${finalSlug}". The old URL will redirect to the new one. Continue?`
      );
      if (!ok) return;
    }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("parentService", parentService ?? "null");
    fd.append("displayOrder", String(displayOrder));
    fd.append("featured", String(featured));
    fd.append("status", String(status));

    if (isTopLevel) {
      fd.append("description", description);
      fd.append("bullets", JSON.stringify(bullets.filter((b) => b.trim())));
    } else {
      fd.append("shortDescription", shortDescription);
      fd.append("tagline", tagline);
      fd.append("introTitle", introTitle);
      fd.append("introDescription", introDescription);
      // rows are validated above, so nothing is silently dropped here
      fd.append(
        "process",
        JSON.stringify(process.map((p) => ({ ...p, title: p.title.trim(), description: p.description.trim() })))
      );
      fd.append(
        "technologies",
        JSON.stringify(technologies.map((t) => ({ ...t, description: t.description.trim() })))
      );
    }
    fd.append("industries", JSON.stringify(industries));
    if (bannerFile) fd.append("bannerImage", bannerFile);
    if (heroFile) fd.append("heroImage", heroFile);

    // ── META ──
    // SeoPreview keeps og_image/twitter_image as either a File (freshly picked)
    // or the saved server path. Files go up as uploads; strings ride along in the
    // JSON, so an image cleared to "" tells the controller to unlink the old file.
    const { og_image, twitter_image, ...metaRest } = meta;

    fd.append("meta", JSON.stringify({
      ...metaRest,
      slug: finalSlug,
      // undefined keys are dropped by JSON.stringify — the controller then
      // fills them in from the uploaded file
      og_image: og_image instanceof File ? undefined : (og_image ?? ""),
      twitter_image: twitter_image instanceof File ? undefined : (twitter_image ?? ""),
    }));

    if (og_image instanceof File) fd.append("og_image", og_image);
    if (twitter_image instanceof File) fd.append("twitter_image", twitter_image);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateServiceApi(id, fd);
        toast.success("Service updated");
      } else {
        await addServiceApi(fd);
        toast.success("Service added");
      }
      navigate("/admin-dash/service");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(err?.response?.data?.message || "This slug is already in use");
      } else {
        toast.error(err?.response?.data?.message || "Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading service...</p>
        </div>
      </div>
    );
  }

  const shownBanner = bannerPreview || (existingBanner ? imgSrc(existingBanner) : "");
  const shownHero = heroPreview || (existingHero ? imgSrc(existingHero) : "");

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Service" : "Add Service"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/service")}>
          ← Back to Services
        </button>
      </div>

      <div className="p-md-2 mb-4">
        <div className="row">
          <div className="col-md-6">
            <label htmlFor="title" className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Digital Engineering"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}

            {meta.slug && (
              <p className="text-muted mt-1 mb-0" style={{ fontSize: "13px" }}>
                Slug: <code>{meta.slug}</code> — edit it in the SEO section below
              </p>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Parent Service</label>
            <Select
              options={parentOptions}
              value={parentOptions.find((o) => o.value === parentService) ?? null}
              onChange={(v) => setParentService(v?.value ?? null)}
              isClearable
              placeholder="None — this is a top-level service"
              classNamePrefix="react-select"
            />
            <small className="text-muted">
              Leave empty to create a top-level service (like &quot;Digital Engineering&quot;). Only top-level services can be picked as a parent.
            </small>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <label className="form-label">Display Order</label>
            <input type="number" min={0} className="form-control" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select className="form-control" value={status ? "true" : "false"} onChange={(e) => setStatus(e.target.value === "true")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <label className="form-check-label d-flex align-items-center gap-2">
              <input type="checkbox" className="form-check-input" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured
            </label>
          </div>
        </div>

        {isTopLevel ? (
          <>
            {/* ── TOP-LEVEL FIELDS ── */}
            <label htmlFor="description" className="form-label mt-3">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}

            <div className="mt-3">
              <h6>Banner Image</h6>
              <input ref={bannerRef} type="file" accept="image/*" className="d-none"
                onChange={(e) => { pickImage(e.target.files?.[0], setBannerFile, setBannerPreview); e.target.value = ""; }} />
              {shownBanner ? (
                <div className="d-flex align-items-center gap-3">
                  <img src={shownBanner} alt="Banner" className="img-thumbnail" style={{ width: "180px", height: "120px", objectFit: "cover" }} />
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => bannerRef.current?.click()}>Change</button>
                    <button type="button" className="btn btn-sm btn-outline-danger"
                      onClick={() => { setBannerFile(null); setBannerPreview(""); setExistingBanner(""); }}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-box text-center p-5 border" style={{ cursor: "pointer" }} onClick={() => bannerRef.current?.click()}>
                  <p className="mb-1">Click to select image</p><h4>+</h4>
                </div>
              )}
            </div>

            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header fw-semibold bg-light d-flex justify-content-between align-items-center">
                <span>Bullets <span className="text-muted" style={{ fontSize: 12 }}>(shown on the Services listing page)</span></span>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={addBullet}>+ Add Bullet</button>
              </div>
              <div className="card-body">
                {bullets.map((b, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <input className="form-control" value={b} onChange={(e) => updateBullet(i, e.target.value)} placeholder="e.g. Corporate & Institutional Websites" />
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeBullet(i)}>Remove</button>
                  </div>
                ))}
                {bullets.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No bullets yet.</p>}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ── LEAF FIELDS ── */}
            <label htmlFor="shortDescription" className="form-label mt-3">
              Short Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="shortDescription"
              className={`form-control ${errors.shortDescription ? "is-invalid" : ""}`}
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
            {errors.shortDescription && <div className="invalid-feedback d-block">{errors.shortDescription}</div>}

            <label className="form-label mt-3">Tagline</label>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
                className="custom-quill"
                value={tagline}
                onChange={(v) => setTagline(cleanQuill(v))}
                modules={Modules}
                theme="snow"
                placeholder="e.g. Your website is the first handshake with every customer..."
              />
            </Suspense>

            <div className="mt-3">
              <h6>Hero Image</h6>
              <input ref={heroRef} type="file" accept="image/*" className="d-none"
                onChange={(e) => { pickImage(e.target.files?.[0], setHeroFile, setHeroPreview); e.target.value = ""; }} />
              {shownHero ? (
                <div className="d-flex align-items-center gap-3">
                  <img src={shownHero} alt="Hero" className="img-thumbnail" style={{ width: "180px", height: "120px", objectFit: "cover" }} />
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => heroRef.current?.click()}>Change</button>
                    <button type="button" className="btn btn-sm btn-outline-danger"
                      onClick={() => { setHeroFile(null); setHeroPreview(""); setExistingHero(""); }}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-box text-center p-5 border" style={{ cursor: "pointer" }} onClick={() => heroRef.current?.click()}>
                  <p className="mb-1">Click to select image</p><h4>+</h4>
                </div>
              )}
            </div>

            <label htmlFor="introTitle" className="form-label mt-3">
              Intro Title <span className="text-danger">*</span>
            </label>
            <input
              id="introTitle"
              className={`form-control ${errors.introTitle ? "is-invalid" : ""}`}
              value={introTitle}
              onChange={(e) => setIntroTitle(e.target.value)}
            />
            {errors.introTitle && <div className="invalid-feedback">{errors.introTitle}</div>}

            <label htmlFor="introDescription" className="form-label mt-3">
              Intro Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="introDescription"
              className={`form-control ${errors.introDescription ? "is-invalid" : ""}`}
              rows={3}
              value={introDescription}
              onChange={(e) => setIntroDescription(e.target.value)}
            />
            {errors.introDescription && <div className="invalid-feedback d-block">{errors.introDescription}</div>}

            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header fw-semibold bg-light d-flex justify-content-between align-items-center">
                <span>Process</span>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={addProcessStep}>+ Add Step</button>
              </div>
              <div className="card-body">
                {process.map((p, i) => (
                  <div key={i} className="row g-2 mb-2 align-items-start">
                    <div className="col-md-3">
                      <input
                        id={`process-${i}-title`}
                        className={`form-control ${errors.process[i]?.title ? "is-invalid" : ""}`}
                        placeholder="Step title (e.g. Discovery)"
                        value={p.title}
                        onChange={(e) => updateProcessStep(i, "title", e.target.value)}
                      />
                      {errors.process[i]?.title && (
                        <div className="invalid-feedback">{errors.process[i]?.title}</div>
                      )}
                    </div>
                    <div className="col-md-7">
                      <textarea
                        id={`process-${i}-description`}
                        className={`form-control ${errors.process[i]?.description ? "is-invalid" : ""}`}
                        rows={2}
                        placeholder="Step description"
                        value={p.description}
                        onChange={(e) => updateProcessStep(i, "description", e.target.value)}
                      />
                      {errors.process[i]?.description && (
                        <div className="invalid-feedback">{errors.process[i]?.description}</div>
                      )}
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeProcessStep(i)}>Remove</button>
                    </div>
                  </div>
                ))}
                {process.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No process steps yet.</p>}
              </div>
            </div>

            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header fw-semibold bg-light d-flex justify-content-between align-items-center">
                <span>Technologies</span>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={addTechnology}>+ Add Technology</button>
              </div>
              <div className="card-body">
                {technologies.map((t, i) => (
                  <div key={i} className="row g-2 mb-2 align-items-start">
                    {/* id sits on the wrapper so scrollToId can reach the react-select */}
                    <div className="col-md-3" id={`technology-${i}`}>
                      <Select
                        options={technologyOptions.filter(
                          (o) => o.value === t.technology || !technologies.some((x) => x.technology === o.value)
                        )}
                        value={technologyOptions.find((o) => o.value === t.technology) ?? null}
                        onChange={(v) => updateTechnology(i, "technology", v?.value ?? "")}
                        placeholder="Select technology"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: errors.technologies[i]?.technology ? "#dc3545" : base.borderColor,
                          }),
                        }}
                      />
                      {errors.technologies[i]?.technology && (
                        <div className="text-danger mt-1" style={{ fontSize: 12 }}>
                          {errors.technologies[i]?.technology}
                        </div>
                      )}
                    </div>
                    <div className="col-md-7">
                      <textarea
                        id={`technology-${i}-description`}
                        className={`form-control ${errors.technologies[i]?.description ? "is-invalid" : ""}`}
                        rows={2}
                        placeholder="Why this tech is used for this service"
                        value={t.description}
                        onChange={(e) => updateTechnology(i, "description", e.target.value)}
                      />
                      {errors.technologies[i]?.description && (
                        <div className="invalid-feedback">{errors.technologies[i]?.description}</div>
                      )}
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeTechnology(i)}>Remove</button>
                    </div>
                  </div>
                ))}
                {technologies.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No technologies yet.</p>}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Industry <span className="text-danger">*</span>
              </label>
              <div id="industry" tabIndex={-1}>
                <Select
                  isMulti                                           // ✅ multi
                  options={industryOptions}
                  value={industryOptions.filter((o) => industries.includes(o.value))}
                  onChange={(v) => setIndustries(v.map((o) => o.value))}
                  placeholder="Select industries"
                  classNamePrefix="react-select"
                  styles={errors.industry ? { control: (base) => ({ ...base, borderColor: "#dc3545" }) } : undefined}
                />
              </div>
              {errors.industry && (
                <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.industry}</div>
              )}
            </div>

            <div className="alert alert-info mt-4" style={{ fontSize: 13 }}>
              FAQs are managed from the Services list — use the &quot;FAQs&quot; button on this service's row after saving.
            </div>
          </>
        )}

        {/* ── SEO ── */}
        <div className="mt-4">
          <h6 className="fw-semibold">SEO</h6>
          <SeoPreview
            value={meta}
            onChange={setMeta}
            baseUrl={SEO_BASE_URL}
            onManualEdit={(field) => {
              if (field === "slug") setSlugTouched(true);
              if (field === "meta_title") setMetaTitleTouched(true);
              if (field === "meta_description") setMetaDescriptionTouched(true);
            }}
          />
          {isEditMode && originalSlug && meta.slug !== originalSlug && (
            <div className="text-warning mt-2" style={{ fontSize: 13 }}>
              Changing the slug moves this page&apos;s URL. The old one is archived and redirects to the new one.
            </div>
          )}
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Service" : "Add Service"}
          </button>
          {isEditMode && (
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/admin-dash/service")} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}