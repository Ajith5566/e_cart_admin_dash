// components/caseStudy/Add_caseStudy.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
  addCaseStudyApi,
  getCaseStudyByIdApi,
  updateCaseStudyApi,
  removeGalleryImageApi,
  getAllCaseStudiesApi,
  getAllIndustriesApi,
  getAllServicesApi,
  getAllTechnologiesApi,
  getAllSolutionsApi,
} from "../../services/allAPi";
import { cleanQuill, Modules } from "../quillmodule";
import type { MetaFields } from "../../types/types";
import type {
  CaseStudyGalleryItem,
  CaseStudyStatistic,
  CaseStudyTestimonial,
} from "../../types/caseStudyTypes";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";
import { imgSrc } from "../../utils/imgSrc";

const ReactQuill = lazy(() => import("react-quill-new"));

const emptyTestimonial: CaseStudyTestimonial = {
  clientName: "", company: "", designation: "", quote: "", video: "", thumbnail: "",
};

type FormErrors = {
  title: string;
  bannerImage: string;
  industry: string;
  overview: string;
  challenge: string;
  proposedSolution: string;
  implementation: string;
  outcome: string;
  statistics: string;
  gallery: string; // ✅ ADD — mandatory labels for gallery images
};

const emptyErrors: FormErrors = {
  title: "",
  bannerImage: "",
  industry: "",
  overview: "",
  challenge: "",
  proposedSolution: "",
  implementation: "",
  outcome: "",
  statistics: "",
  gallery: "", // ✅ ADD
};

// strip HTML tags to check if a Quill field has real content (not just empty <p></p>)
const hasRealContent = (html: string) => html.replace(/<[^>]*>/g, "").trim().length > 0;

export default function Add_caseStudy() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // ── basic ─────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [location, setLocation] = useState("");
  const [tagline, setTagline] = useState("");

  // ── client ────────────────────────────────────────────────
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientDesignation, setClientDesignation] = useState("");

  // ── project details ───────────────────────────────────────
  const [industry, setIndustry] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);
  const [relatedCaseStudies, setRelatedCaseStudies] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // ── relation options ─────────────────────────────────────
  const [industryOptions, setIndustryOptions] = useState<{ value: string; label: string }[]>([]);
  const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
  const [technologyOptions, setTechnologyOptions] = useState<{ value: string; label: string }[]>([]);
  const [solutionOptions, setSolutionOptions] = useState<{ value: string; label: string }[]>([]);
  const [caseStudyOptions, setCaseStudyOptions] = useState<{ value: string; label: string }[]>([]);

  // ── images ────────────────────────────────────────────────
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [existingBanner, setExistingBanner] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [existingLogo, setExistingLogo] = useState("");

  // ✅ gallery: new files + parallel labels, existing items as CaseStudyGalleryItem[]
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryLabels, setGalleryLabels] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<CaseStudyGalleryItem[]>([]);

  const bannerRef = useRef<HTMLInputElement | null>(null);
  const logoRef = useRef<HTMLInputElement | null>(null);
  const galleryRef = useRef<HTMLInputElement | null>(null);
  const thumbRef = useRef<HTMLInputElement | null>(null);

  // ── content sections ──────────────────────────────────────
  const [overview, setOverview] = useState("");
  const [challenge, setChallenge] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [implementation, setImplementation] = useState("");
  const [outcome, setOutcome] = useState("");

  // ── statistics ────────────────────────────────────────────
  const [statistics, setStatistics] = useState<CaseStudyStatistic[]>([
    { title: "", value: "", isFeatured: false },
  ]);

  // ── testimonial ───────────────────────────────────────────
  const [testimonial, setTestimonial] = useState<CaseStudyTestimonial>(emptyTestimonial);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState("");
  const [existingThumb, setExistingThumb] = useState("");
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  // ── SEO ───────────────────────────────────────────────────
  const [meta, setMeta] = useState<MetaFields>({});
  const [originalSlug, setOriginalSlug] = useState("");
  const [proposedSlug, setProposedSlug] = useState("");
  const [showSlugPrompt, setShowSlugPrompt] = useState(false);
  const [slugDecisionMade, setSlugDecisionMade] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
  const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);

  const [errors, setErrors] = useState<FormErrors>(emptyErrors);
  const [formSubmitted, setFormSubmitted] = useState(false); // ✅ ADD — drives per-item gallery label highlighting

  // ── fetch dropdown options ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [ind, svc, tech, sol, cs] = await Promise.all([
          getAllIndustriesApi(),
          getAllServicesApi(),
          getAllTechnologiesApi(),
          getAllSolutionsApi(),
          getAllCaseStudiesApi(),
        ]);
        setIndustryOptions((ind.data.data ?? []).map((i: any) => ({ value: i._id, label: i.name })));
        setServiceOptions((svc.data.data ?? []).map((s: any) => ({ value: s._id, label: s.title })));
        setTechnologyOptions((tech.data.data ?? []).map((t: any) => ({ value: t._id, label: t.name })));
        setSolutionOptions((sol.data.data ?? []).map((s: any) => ({ value: s._id, label: s.name })));
        setCaseStudyOptions((cs.data.data ?? [])
          .filter((c: any) => c._id !== id)
          .map((c: any) => ({ value: c._id, label: c.title })));
      } catch {
        toast.error("Failed to load options");
      }
    };
    load();
  }, [id]);

  // ── fetch case study in edit mode ─────────────────────────
  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchCS = async () => {
      try {
        const res = await getCaseStudyByIdApi(id);
        const cs = res.data.data;

        setTitle(cs.title ?? "");
        setLocation(cs.location ?? "");
        setTagline(cs.tagline ?? "");
        setShortDescription(cs.shortDescription ?? "");
        setStatus(cs.isActive);
        setFeatured(cs.featured ?? false);
        setClientName(cs.clientName ?? "");
        setClientCompany(cs.clientCompany ?? "");
        setClientDesignation(cs.clientDesignation ?? "");
        setIndustry((cs.industry as any)?._id ?? "");
        setSelectedServices((cs.services ?? []).map((s: any) => s._id));
        setSelectedTechnologies((cs.technologies ?? []).map((t: any) => t._id));
        setSelectedSolutions((cs.solutions ?? []).map((s: any) => s._id));
        setRelatedCaseStudies((cs.relatedCaseStudies ?? []).map((r: any) => r._id));
        setTimeline(cs.timeline ?? "");
        setWebsiteUrl(cs.websiteUrl ?? "");
        setExistingBanner(cs.bannerImage ?? "");
        setExistingLogo(cs.logo ?? "");
        // ✅ gallery now comes back as [{ image, label }]
        setExistingGallery(cs.gallery ?? []);
        setOverview(cs.overview ?? "");
        setChallenge(cs.challenge ?? "");
        setProposedSolution(cs.proposedSolution ?? "");
        setImplementation(cs.implementation ?? "");
        setOutcome(cs.outcome ?? "");
        setStatistics(cs.statistics?.length ? cs.statistics : [{ title: "", value: "", isFeatured: false }]);
        setTestimonial(cs.testimonial ?? emptyTestimonial);
        setExistingThumb(cs.testimonial?.thumbnail ?? "");

        if (cs.meta && Object.keys(cs.meta).length > 0) {
          setMeta(cs.meta as MetaFields);
          setOriginalSlug((cs.meta as any).slug ?? "");
          setSlugManuallyEdited(true);
          setMetaTitleManuallyEdited(true);
          setMetaDescManuallyEdited(true);
        }
      } catch {
        toast.error("Failed to load case study");
        navigate("/admin-dash/case-study");
      } finally {
        setLoadingData(false);
      }
    };

    fetchCS();
  }, [id]);

  // ── slug auto-fill ────────────────────────────────────────
  useEffect(() => {
    if (!title) return;
    const generatedSlug = slugify(title, { lower: true, strict: true, trim: true });

    if (isEditMode && originalSlug && !slugDecisionMade) {
      if (generatedSlug !== originalSlug) { setProposedSlug(generatedSlug); setShowSlugPrompt(true); }
      else { setShowSlugPrompt(false); setProposedSlug(""); }
    }

    setMeta((prev) => ({
      ...prev,
      slug: isEditMode || slugManuallyEdited ? prev.slug : generatedSlug,
      meta_title: metaTitleManuallyEdited ? prev.meta_title : title,
      meta_description: metaDescManuallyEdited ? prev.meta_description : shortDescription,
    }));
  }, [title, shortDescription, slugManuallyEdited, metaTitleManuallyEdited, metaDescManuallyEdited, isEditMode, originalSlug, slugDecisionMade]);

  // ── statistics helpers ─────────────────────────────────────
  const addStat = () => setStatistics((prev) => [...prev, { title: "", value: "", isFeatured: false }]);
  const removeStat = (i: number) => setStatistics((prev) => prev.filter((_, idx) => idx !== i));
  const updateStat = (i: number, field: keyof CaseStudyStatistic, value: string | boolean) => {
    setStatistics((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  // ── gallery helpers ────────────────────────────────────────
  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setGalleryFiles((prev) => [...prev, ...newFiles]);
    setGalleryPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
    setGalleryLabels((prev) => [...prev, ...newFiles.map(() => "")]);
  };

  const removeNewGalleryFile = (i: number) => {
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i));
    setGalleryPreviews((prev) => prev.filter((_, idx) => idx !== i));
    setGalleryLabels((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateNewGalleryLabel = (i: number, label: string) => {
    setGalleryLabels((prev) => prev.map((l, idx) => idx === i ? label : l));
  };

  const updateExistingGalleryLabel = (i: number, label: string) => {
    setExistingGallery((prev) => prev.map((item, idx) => idx === i ? { ...item, label } : item));
  };

  // ✅ backend's DELETE endpoint expects { imagePath } — matches removeGalleryImage controller
  const removeExistingGalleryImage = async (image: string) => {
    if (!id) { setExistingGallery((prev) => prev.filter((item) => item.image !== image)); return; }
    try {
      await removeGalleryImageApi(id, image);
      setExistingGallery((prev) => prev.filter((item) => item.image !== image));
      toast.success("Gallery image removed");
    } catch { toast.error("Failed to remove gallery image"); }
  };

  // ── scroll to first invalid field ──────────────────────────
  const scrollToFirstError = (newErrors: FormErrors) => {
    const firstErrorKey = Object.keys(newErrors).find(
      (key) => newErrors[key as keyof FormErrors] !== ""
    );
    if (!firstErrorKey) return;
    const element = document.getElementById(firstErrorKey);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        if (typeof (element as HTMLElement).focus === "function") {
          (element as HTMLElement).focus();
        }
      }, 300);
    }
  };

  // ── validation (mandatory fields) ──────────────────────────
  const validateForm = () => {
    const next: FormErrors = { ...emptyErrors };
    let ok = true;

    if (!title.trim()) {
      next.title = "Title is required";
      ok = false;
    }

    if (!bannerFile && !existingBanner) {
      next.bannerImage = "Banner image is required";
      ok = false;
    }

    if (!industry) {
      next.industry = "Industry is required";
      ok = false;
    }

    if (!hasRealContent(overview)) {
      next.overview = "Overview is required";
      ok = false;
    }

    if (!hasRealContent(challenge)) {
      next.challenge = "Challenge is required";
      ok = false;
    }

    if (!hasRealContent(proposedSolution)) {
      next.proposedSolution = "Proposed Solution is required";
      ok = false;
    }

    if (!hasRealContent(implementation)) {
      next.implementation = "Implementation is required";
      ok = false;
    }

    if (!hasRealContent(outcome)) {
      next.outcome = "Outcome is required";
      ok = false;
    }

    const hasCompleteStat = statistics.some(
      (s) => s.title.trim() !== "" && s.value.trim() !== ""
    );
    if (!hasCompleteStat) {
      next.statistics = "At least one complete statistic (title + value) is required";
      ok = false;
    }

    // ✅ ADD — every gallery image (existing or newly added) must have a non-empty label
    const hasEmptyExistingLabel = existingGallery.some((item) => !item.label?.trim());
    const hasEmptyNewLabel = galleryLabels.some((l) => !l.trim());
    if (hasEmptyExistingLabel || hasEmptyNewLabel) {
      next.gallery = "Every gallery image needs a label";
      ok = false;
    }

    setErrors(next);
    setFormSubmitted(true); // ✅ ADD — enables per-thumbnail highlighting of missing labels

    if (!ok) {
      scrollToFirstError(next);
    }

    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (showSlugPrompt) {
      toast.warning("Please choose whether to keep or update the URL");
      document.getElementById("slug-prompt")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // strip incomplete statistic rows before sending
    const cleanedStatistics = statistics.filter(
      (s) => s.title.trim() !== "" && s.value.trim() !== ""
    );

    const metaWithoutImages = { ...meta };
    delete metaWithoutImages.og_image;
    delete metaWithoutImages.twitter_image;

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("shortDescription", shortDescription);
    fd.append("status", String(status));
    fd.append("featured", String(featured));
    fd.append("tagline", tagline);
    fd.append("location", location);
    fd.append("clientName", clientName);
    fd.append("clientCompany", clientCompany);
    fd.append("clientDesignation", clientDesignation);
    fd.append("industry", industry);
    fd.append("timeline", timeline);
    fd.append("websiteUrl", websiteUrl);
    fd.append("overview", overview);
    fd.append("challenge", challenge);
    fd.append("proposedSolution", proposedSolution);
    fd.append("implementation", implementation);
    fd.append("outcome", outcome);
    fd.append("services", JSON.stringify(selectedServices));
    fd.append("technologies", JSON.stringify(selectedTechnologies));
    fd.append("solutions", JSON.stringify(selectedSolutions));
    fd.append("relatedCaseStudies", JSON.stringify(relatedCaseStudies));
    fd.append("statistics", JSON.stringify(cleanedStatistics));
    fd.append("meta", JSON.stringify(metaWithoutImages));

    fd.append("testimonial_clientName", testimonial.clientName);
    fd.append("testimonial_company", testimonial.company);
    fd.append("testimonial_designation", testimonial.designation);
    fd.append("testimonial_quote", testimonial.quote);
    fd.append("testimonial_video", testimonial.video);
    fd.append("removeThumbnail", String(removeThumbnail));
    if (bannerFile) fd.append("bannerImage", bannerFile);
    if (logoFile) fd.append("logo", logoFile);
    if (thumbFile) fd.append("testimonial_thumbnail", thumbFile);
    if (meta.og_image instanceof File) fd.append("og_image", meta.og_image);
    if (meta.twitter_image instanceof File) fd.append("twitter_image", meta.twitter_image);

    // ✅ gallery: file + label in parallel arrays — matches parseGalleryLabels on backend
    for (const f of galleryFiles) fd.append("gallery", f);
    for (const l of galleryLabels) fd.append("galleryLabels", l);

    // ✅ existing gallery labels — matches req.body.existingGalleryLabels in updateCaseStudy
    fd.append("existingGalleryLabels", JSON.stringify(existingGallery.map((item) => item.label)));

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateCaseStudyApi(id, fd);
        toast.success("Case study updated");
      } else {
        await addCaseStudyApi(fd);
        toast.success("Case study created");
      }
      navigate("/admin-dash/case-study");
    } catch (err: any) {
      if (err?.response?.status === 409) toast.error("A case study with this slug already exists");
      else toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Loading...</span></div>
          <p className="text-muted mb-0">Loading case study...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Case Study" : "Add Case Study"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/case-study")}>
          ← Back to Case Studies
        </button>
      </div>

      <div className="p-md-2 mb-4">

        {/* ── BASIC INFO ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Basic Information</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <label htmlFor="title" className="form-label">Title <span className="text-danger">*</span></label>
                <input id="title" className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  value={title} onChange={(e) => setTitle(e.target.value)} />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}

                {showSlugPrompt && (
                  <div id="slug-prompt" className="alert alert-info mt-2">
                    <p className="mb-2 fw-semibold">The title change affects this case study's URL.</p>
                    <p className="mb-1 small">Current: <code>/{originalSlug}</code></p>
                    <p className="mb-3 small">New: <code>/{proposedSlug}</code></p>
                    <div className="d-flex gap-2 flex-wrap">
                      <button type="button" className="btn btn-sm btn-outline-secondary"
                        onClick={() => { setMeta((p) => ({ ...p, slug: originalSlug })); setShowSlugPrompt(false); setSlugDecisionMade(true); setSlugManuallyEdited(true); toast.info("Old URL kept"); }}>
                        Keep old URL
                      </button>
                      <button type="button" className="btn btn-sm btn-primary"
                        onClick={() => { setMeta((p) => ({ ...p, slug: proposedSlug })); setShowSlugPrompt(false); setSlugDecisionMade(true); setSlugManuallyEdited(true); toast.info("URL will be updated"); }}>
                        Update URL (old link will redirect)
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-2">
                <label className="form-label">Status</label>
                <select className="form-control" value={status ? "true" : "false"} onChange={(e) => setStatus(e.target.value === "true")}>
                  <option value="true">Active</option>
                  <option value="false">Draft</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Location</label>
                <input type="text" className="form-control"
                  value={location} onChange={(e) => setLocation((e.target.value))} />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-12">
                <label className="form-label">Short Description</label>
                <textarea className="form-control" rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </div>
            </div>

            <label className="form-label mt-3">headline</label>
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
              <label className="form-check-label d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input" checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)} />
                Mark as Featured
              </label>
            </div>
          </div>
        </div>

        {/* ── CLIENT DETAILS ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Client Details</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Client Name</label>
                <input className="form-control" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Company</label>
                <input className="form-control" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Designation</label>
                <input className="form-control" value={clientDesignation} onChange={(e) => setClientDesignation(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── PROJECT DETAILS ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Project Details</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">
                  Industry <span className="text-danger">*</span>
                </label>
                <div id="industry" tabIndex={-1}>
                  <Select
                    options={industryOptions}
                    value={industryOptions.find((o) => o.value === industry) ?? null}
                    onChange={(v) => setIndustry(v?.value ?? "")}
                    isClearable
                    placeholder="Select industry"
                    classNamePrefix="react-select"
                    styles={errors.industry ? { control: (base) => ({ ...base, borderColor: "#dc3545" }) } : undefined}
                  />
                </div>
                {errors.industry && (
                  <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.industry}</div>
                )}
              </div>
              <div className="col-md-3">
                <label className="form-label">Timeline</label>
                <input className="form-control" placeholder="e.g. 6 months" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Website URL</label>
                <input type="url" className="form-control" placeholder="https://..." value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4">
                <label className="form-label">Services</label>
                <Select isMulti options={serviceOptions}
                  value={serviceOptions.filter((o) => selectedServices.includes(o.value))}
                  onChange={(v) => setSelectedServices(v.map((o) => o.value))}
                  placeholder="Select services" classNamePrefix="react-select" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Technologies</label>
                <Select isMulti options={technologyOptions}
                  value={technologyOptions.filter((o) => selectedTechnologies.includes(o.value))}
                  onChange={(v) => setSelectedTechnologies(v.map((o) => o.value))}
                  placeholder="Select technologies" classNamePrefix="react-select" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Solutions</label>
                <Select isMulti options={solutionOptions}
                  value={solutionOptions.filter((o) => selectedSolutions.includes(o.value))}
                  onChange={(v) => setSelectedSolutions(v.map((o) => o.value))}
                  placeholder="Select solutions" classNamePrefix="react-select" />
              </div>
            </div>
          </div>
        </div>

        {/* ── IMAGES ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Images</div>
          <div className="card-body">
            <div className="row">
              {/* Banner */}
              <div className="col-md-6">
                <h6 id="bannerImage">Banner Image <span className="text-danger">*</span></h6>
                <input ref={bannerRef} type="file" accept="image/*" className="d-none"
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); e.target.value = "";
                  }} />
                {(bannerPreview || existingBanner) ? (
                  <div>
                    <img src={bannerPreview || imgSrc(existingBanner)} alt="Banner"
                      className="img-thumbnail" style={{ width: "100%", maxHeight: "180px", objectFit: "cover" }} />
                    <div className="d-flex gap-2 mt-2">
                      <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => bannerRef.current?.click()}>Change</button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        onClick={() => { setBannerFile(null); setBannerPreview(""); setExistingBanner(""); }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className={`upload-box text-center p-5 border ${errors.bannerImage ? "border-danger" : ""}`}
                    style={{ cursor: "pointer" }} onClick={() => bannerRef.current?.click()}>
                    <p className="mb-1">Click to select banner image</p><h4>+</h4>
                  </div>
                )}
                {errors.bannerImage && <div className="text-danger mt-1">{errors.bannerImage}</div>}
              </div>

              {/* Logo */}
              <div className="col-md-3">
                <h6>Client Logo</h6>
                <input ref={logoRef} type="file" accept="image/*" className="d-none"
                  onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); e.target.value = "";
                  }} />
                {(logoPreview || existingLogo) ? (
                  <div>
                    <div className="border d-flex align-items-center justify-content-center"
                      style={{ width: "100px", height: "100px", borderRadius: "8px", background: "#f8f9fa" }}>
                      <img src={logoPreview || imgSrc(existingLogo)} alt="Logo"
                        style={{ maxWidth: "90px", maxHeight: "90px", objectFit: "contain" }} />
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => logoRef.current?.click()}>Change</button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        onClick={() => { setLogoFile(null); setLogoPreview(""); setExistingLogo(""); }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-box text-center p-4 border" style={{ cursor: "pointer", width: "100px", height: "100px" }}
                    onClick={() => logoRef.current?.click()}>
                    <p className="mb-0 small text-primary">Upload</p><h5>+</h5>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ GALLERY with mandatory labels */}
            <div id="gallery" className="mt-4">
              <h6>
                Gallery{" "}
                <span className="text-muted" style={{ fontSize: "12px" }}>
                  (multiple images — label is required for each image)
                </span>
              </h6>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="d-none"
                onChange={(e) => { addGalleryFiles(e.target.files); e.target.value = ""; }} />
              <button type="button" className="btn btn-outline-dark btn-sm mb-3"
                onClick={() => galleryRef.current?.click()}>+ Add images</button>

              {errors.gallery && (
                <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>{errors.gallery}</div>
              )}

              <div className="d-flex flex-wrap gap-3">
                {/* existing gallery items */}
                {existingGallery.map((item, i) => {
                  const labelMissing = formSubmitted && !item.label?.trim();
                  return (
                    <div key={item._id ?? item.image} style={{ width: "150px" }}>
                      <div style={{ position: "relative" }}>
                        <img src={imgSrc(item.image)} alt={item.label || "gallery"}
                          style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "6px" }} />
                        <button type="button" className="btn btn-danger btn-sm"
                          style={{ position: "absolute", top: 4, right: 4, padding: "1px 6px", fontSize: "11px" }}
                          onClick={() => removeExistingGalleryImage(item.image)}>✕</button>
                      </div>
                      <input
                        type="text"
                        className={`form-control form-control-sm mt-1 ${labelMissing ? "is-invalid" : ""}`}
                        placeholder='Label (required) — e.g. "01 Homepage — Desktop"'
                        value={item.label}
                        onChange={(e) => updateExistingGalleryLabel(i, e.target.value)}
                      />
                      {labelMissing && (
                        <div className="text-danger" style={{ fontSize: "11px" }}>Label is required</div>
                      )}
                    </div>
                  );
                })}

                {/* new gallery files */}
                {galleryPreviews.map((src, i) => {
                  const labelMissing = formSubmitted && !(galleryLabels[i] ?? "").trim();
                  return (
                    <div key={i} style={{ width: "150px" }}>
                      <div style={{ position: "relative" }}>
                        <img src={src} alt="new gallery"
                          style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "2px solid #0d6efd" }} />
                        <button type="button" className="btn btn-danger btn-sm"
                          style={{ position: "absolute", top: 4, right: 4, padding: "1px 6px", fontSize: "11px" }}
                          onClick={() => removeNewGalleryFile(i)}>✕</button>
                      </div>
                      <input
                        type="text"
                        className={`form-control form-control-sm mt-1 ${labelMissing ? "is-invalid" : ""}`}
                        placeholder='Label (required) — e.g. "02 Product Catalogue"'
                        value={galleryLabels[i] ?? ""}
                        onChange={(e) => updateNewGalleryLabel(i, e.target.value)}
                      />
                      {labelMissing && (
                        <div className="text-danger" style={{ fontSize: "11px" }}>Label is required</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT SECTIONS (all mandatory) ── */}
        {[
          { id: "overview", label: "Overview", value: overview, setter: setOverview, error: errors.overview },
          { id: "challenge", label: "Challenge", value: challenge, setter: setChallenge, error: errors.challenge },
          { id: "proposedSolution", label: "Proposed Solution", value: proposedSolution, setter: setProposedSolution, error: errors.proposedSolution },
          { id: "implementation", label: "Implementation", value: implementation, setter: setImplementation, error: errors.implementation },
          { id: "outcome", label: "Outcome", value: outcome, setter: setOutcome, error: errors.outcome },
        ].map(({ id: sectionId, label, value, setter, error }) => (
          <div key={sectionId} id={sectionId} className="card mb-4 border-0 shadow-sm">
            <div className="card-header fw-semibold bg-light">
              {label} <span className="text-danger">*</span>
            </div>
            <div className="card-body">
              <Suspense fallback={<div>Loading editor...</div>}>
                <ReactQuill className={`custom-quill ${error ? "is-invalid" : ""}`}
                  value={value} onChange={(v) => setter(cleanQuill(v))} modules={Modules} theme="snow" />
              </Suspense>
              {error && (
                <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{error}</div>
              )}
            </div>
          </div>
        ))}

        {/* ── STATISTICS ── */}
        <div id="statistics" className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light d-flex justify-content-between align-items-center">
            <span>Statistics <span className="text-danger">*</span> <span className="text-muted" style={{ fontSize: "12px" }}>(at least one)</span></span>
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={addStat}>+ Add Stat</button>
          </div>
          <div className="card-body">
            {errors.statistics && (
              <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>{errors.statistics}</div>
            )}
            {statistics.map((stat, i) => (
              <div key={i} className="row align-items-center mb-3 g-2">
                <div className="col-md-4">
                  <input className="form-control" placeholder="Title (e.g. Customer satisfaction rate)"
                    value={stat.title} onChange={(e) => updateStat(i, "title", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" placeholder="Value (e.g. 95%)"
                    value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-check-label d-flex align-items-center gap-2">
                    <input type="checkbox" className="form-check-input" checked={stat.isFeatured}
                      onChange={(e) => updateStat(i, "isFeatured", e.target.checked)} />
                    Featured (green card)
                  </label>
                </div>
                <div className="col-md-2">
                  {statistics.length > 1 && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeStat(i)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TESTIMONIAL ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Testimonial</div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Client Name</label>
                <input className="form-control" value={testimonial.clientName}
                  onChange={(e) => setTestimonial((p) => ({ ...p, clientName: e.target.value }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Company</label>
                <input className="form-control" value={testimonial.company}
                  onChange={(e) => setTestimonial((p) => ({ ...p, company: e.target.value }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Designation</label>
                <input className="form-control" value={testimonial.designation}
                  onChange={(e) => setTestimonial((p) => ({ ...p, designation: e.target.value }))} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Quote</label>
              <textarea className="form-control" rows={3} value={testimonial.quote}
                onChange={(e) => setTestimonial((p) => ({ ...p, quote: e.target.value }))} />
            </div>
            <div className="row">
              <div className="col-md-8">
                <label className="form-label">Video URL (YouTube)</label>
                <input type="url" className="form-control" placeholder="https://youtube.com/..."
                  value={testimonial.video}
                  onChange={(e) => setTestimonial((p) => ({ ...p, video: e.target.value }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Thumbnail</label>
                <input ref={thumbRef} type="file" accept="image/*" className="d-none"
                  onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); e.target.value = ""; }} />
                {(thumbPreview || existingThumb) ? (
                  <div>
                    <img src={thumbPreview || imgSrc(existingThumb)} alt="Thumb"
                      style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "6px" }} />
                    <div className="d-flex gap-2 mt-1">
                      <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => thumbRef.current?.click()}>Change</button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        onClick={() => { setThumbFile(null); setThumbPreview(""); setExistingThumb("");  setRemoveThumbnail(true); }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-box text-center p-3 border" style={{ cursor: "pointer" }} onClick={() => thumbRef.current?.click()}>
                    <p className="mb-0 small text-primary">Upload thumbnail</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED CASE STUDIES ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Related Case Studies</div>
          <div className="card-body">
            <Select isMulti options={caseStudyOptions}
              value={caseStudyOptions.filter((o) => relatedCaseStudies.includes(o.value))}
              onChange={(v) => setRelatedCaseStudies(v.map((o) => o.value))}
              placeholder="Select related case studies" classNamePrefix="react-select" />
          </div>
        </div>

        {/* ── SEO ── */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">SEO</div>
          <div className="card-body">
            <SeoPreview
              value={meta}
              onChange={(next) => {
                setMeta(next);
                if (next.slug !== meta.slug) { setSlugDecisionMade(true); setShowSlugPrompt(false); }
              }}
              baseUrl="https://phitany.com/case-studies/"
              onManualEdit={(field) => {
                if (field === "slug") setSlugManuallyEdited(true);
                if (field === "meta_title") setMetaTitleManuallyEdited(true);
                if (field === "meta_description") setMetaDescManuallyEdited(true);
              }}
            />
          </div>
        </div>

        {/* ── SUBMIT ── */}
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Case Study" : "Add Case Study"}
          </button>
          {isEditMode && (
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/admin-dash/case-study")} disabled={loading}>
              Cancel
            </button>
          )}
        </div>

      </div>
    </div>
  );
}