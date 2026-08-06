// components/blogs/Add_blog.tsx
// ✅ draft/published workflow, isActive visibility toggle, editor-controlled Last Updated date
// ✅ NEW: block-based content editor (Editor / Gallery / YouTube / Quote) replacing
//    fixed description, quote, youtubeUrl fields
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import {
  add_blog_Api,
  getAllauthorsApi,
  getBlogByIdApi,
  updateBlogApi,
  removeBlogBlockImageApi,
  getAllServicesApi,
  getAllCaseStudiesApi, // ⚠️ NEW — add this to services/allAPi, mirrors removeGalleryImageApi
} from "../../services/allAPi";
import { useNavigate, useParams } from "react-router-dom";
import type { MetaFields } from "../../types/types";
import type { AuthorResponse } from "../../types/author_types";
import type { BlogPublicationStatus } from "../../types/blogTypes";
import type { ContentBlock } from "../../types/contentBlockTypes";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";
import { imgSrc } from "../../utils/imgSrc";
import Select from "react-select";
import ContentBlockEditor from "../shared/ContentBlockEditor";

// small helper for displaying audit dates in the sidebar
const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// strip HTML tags to check if a block has real content (not just empty <p></p>)
const hasRealContent = (html: string) => (html || "").replace(/<[^>]*>/g, "").trim().length > 0;

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

// ✅ per-block validation — every block that exists must be genuinely complete.
// Returns a map of blockId -> error message for any block that fails.
const validateContentBlocks = (blocks: ContentBlock[]): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const b of blocks) {
    if (b.type === "editor" || b.type === "quote") {
      const kind = b.type === "editor" ? "Editor" : "Quote";
      if (!(b.label || "").trim()) {
        errors[b.blockId] = `${kind} block needs a label`;
      } else if (!hasRealContent(b.html || "")) {
        errors[b.blockId] = `${kind} block content is required`;
      }
    }

    if (b.type === "youtube") {
      const url = (b.youtubeUrl || "").trim();
      if (!url) errors[b.blockId] = "YouTube URL is required";
      else if (!youtubeRegex.test(url)) errors[b.blockId] = "Enter a valid YouTube URL";
    }

    if (b.type === "gallery") {
      const images = b.images || [];
      if (images.length === 0) {
        errors[b.blockId] = "Add at least one image";
      } else if (images.some((img) => !img.caption.trim())) {
        errors[b.blockId] = "Every image needs a label";
      }
    }
  }

  return errors;
};

export default function Add_blog() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [shortDesc, setShortDesc] = useState("");
  const [readTime, setReadTime] = useState(1);
  const [views, setViews] = useState<number | "">("");

  // ✅ content blocks replace description / quote / youtubeUrl
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [contentError, setContentError] = useState("");
  const [blockErrors, setBlockErrors] = useState<Record<string, string>>({});

  const [isActive, setIsActive] = useState(true);

  const [publicationStatus, setPublicationStatus] = useState<BlogPublicationStatus>("draft");
  const [originalPublicationStatus, setOriginalPublicationStatus] = useState<BlogPublicationStatus | "">("");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [lastContentUpdatedAt, setLastContentUpdatedAt] = useState<string | null>(null);
  const [updateLastContentDate, setUpdateLastContentDate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

   // ── relation options
   const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [relatedCaseStudies, setRelatedCaseStudies] = useState<string[]>([]);
const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
 const [caseStudyOptions, setCaseStudyOptions] = useState<{ value: string; label: string }[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
  const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
  const [meta, setMeta] = useState<MetaFields>({});

  const [originalSlug, setOriginalSlug] = useState("");
  const [proposedSlug, setProposedSlug] = useState("");
  const [showSlugPrompt, setShowSlugPrompt] = useState(false);
  const [slugDecisionMade, setSlugDecisionMade] = useState(false);

  const [errors, setErrors] = useState({
    title: "",
    author: "",
    shortDesc: "",
    image: "",
  });

   // ── fetch dropdown options ─────────────────────────────────
    useEffect(() => {
      const load = async () => {
        try {
          const [ svc, cs] = await Promise.all([
            getAllServicesApi(),
            getAllCaseStudiesApi(),
          ]);
          
          setServiceOptions((svc.data.data ?? []).map((s: any) => ({ value: s._id, label: s.title })));
          setCaseStudyOptions((cs.data.data ?? [])
            .filter((c: any) => c._id !== id)
            .map((c: any) => ({ value: c._id, label: c.title })));
        } catch {
          toast.error("Failed to load options");
        }
      };
      load();
    }, [id]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await getAllauthorsApi();
        setAuthors(res.data.data ?? []);
      } catch {
        toast.error("Failed to load authors");
      }
    };
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchBlog = async () => {
      try {
        const res = await getBlogByIdApi(id);
        console.log(res);
        
        const blog = res.data.data ?? res.data;

        setTitle(blog.title ?? "");
        setAuthor(blog.author?._id ?? "");
        setShortDesc(blog.shortDescription ?? "");
        setContentBlocks(blog.contentBlocks ?? []);
        setReadTime(blog.readTime ?? 1);
        setViews(blog.views ?? "");
        setIsActive(blog.isActive);
        setExistingImage(blog.image ?? "");
         setSelectedServices((blog.services ?? []).map((s: any) => s._id));
        setRelatedCaseStudies((blog.relatedCaseStudies ?? []).map((r: any) => r._id));

        const fetchedStatus: BlogPublicationStatus = blog.publicationStatus ?? "draft";
        setPublicationStatus(fetchedStatus);
        setOriginalPublicationStatus(fetchedStatus);
        setPublishedAt(blog.publishedAt ?? null);
        setLastContentUpdatedAt(blog.lastContentUpdatedAt ?? null);

        if (blog.meta && Object.keys(blog.meta).length > 0) {
          setMeta(blog.meta);
          setOriginalSlug(blog.meta.slug ?? "");
          setSlugManuallyEdited(true);
          setMetaTitleManuallyEdited(true);
          setMetaDescManuallyEdited(true);
        }
      } catch {
        toast.error("Failed to load blog");
        navigate("/admin-dash/blog");
      } finally {
        setLoadingData(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

  useEffect(() => {
    if (!title) return;

    const generatedSlug = slugify(title, { lower: true, strict: true, trim: true });

    if (isEditMode && originalSlug && !slugDecisionMade) {
      if (generatedSlug !== originalSlug) {
        setProposedSlug(generatedSlug);
        setShowSlugPrompt(true);
      } else {
        setShowSlugPrompt(false);
        setProposedSlug("");
      }
    }

    setMeta((prev) => ({
      ...prev,
      slug: isEditMode || slugManuallyEdited ? prev.slug : generatedSlug,
      meta_title: metaTitleManuallyEdited ? prev.meta_title : title,
      meta_description: metaDescManuallyEdited ? prev.meta_description : shortDesc,
    }));
  }, [title, shortDesc, slugManuallyEdited, metaTitleManuallyEdited, metaDescManuallyEdited, isEditMode, originalSlug, slugDecisionMade]);

  const handleKeepOldSlug = () => {
    setMeta((prev) => ({ ...prev, slug: originalSlug }));
    setShowSlugPrompt(false);
    setSlugDecisionMade(true);
    setSlugManuallyEdited(true);
    toast.info("Old URL will be kept");
  };

  const handleUpdateSlug = () => {
    setMeta((prev) => ({ ...prev, slug: proposedSlug }));
    setShowSlugPrompt(false);
    setSlugDecisionMade(true);
    setSlugManuallyEdited(true);
    toast.info("URL will be updated. Old links will redirect automatically.");
  };

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

  // ✅ NEW — immediately delete an already-saved gallery image from the server
  // when the editor removes it from a block, mirroring the case-study pattern
  const handleRemoveExistingGalleryImage = async (blockId: string, imagePath: string) => {
    if (!id) return; // brand-new blog — nothing saved server-side yet, state update is enough
    try {
      await removeBlogBlockImageApi(id, blockId, imagePath);
    } catch {
      toast.error("Failed to remove image");
    }
  };

  // ── scroll to first invalid field (regular inputs) ──────────
  const scrollToFirstError = (newErrors: typeof errors) => {
    const firstErrorKey = Object.keys(newErrors).find(
      (key) => newErrors[key as keyof typeof newErrors] !== ""
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

  // ✅ NEW — scroll to the first content block that failed validation,
  // in the block's own saved order (not object key order)
  const scrollToFirstBlockError = (currentBlocks: ContentBlock[], errs: Record<string, string>) => {
    const firstInvalid = currentBlocks.find((b) => errs[b.blockId]);
    if (!firstInvalid) return;
    const element = document.getElementById(`block-${firstInvalid.blockId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        if (typeof (element as HTMLElement).focus === "function") {
          (element as HTMLElement).focus();
        }
      }, 300);
    }
  };

  const validateForm = () => {
    const next = { title: "", author: "", shortDesc: "", image: "" };
    let ok = true;

    if (!title.trim()) { next.title = "Title is required"; ok = false; }
    if (!author) { next.author = "Author is required"; ok = false; }
    if (!shortDesc.trim()) { next.shortDesc = "Short description is required"; ok = false; }
    if (!imageFile && !existingImage) { next.image = "Blog image is required"; ok = false; }

    setErrors(next);

    // content blocks: both "at least one block" and per-block completeness
    let blocksOk = true;
    if (contentBlocks.length === 0) {
      setContentError("Add at least one content block");
      setBlockErrors({});
      blocksOk = false;
    } else {
      const errs = validateContentBlocks(contentBlocks);
      setBlockErrors(errs);
      if (Object.keys(errs).length > 0) {
        setContentError("");
        blocksOk = false;
      } else {
        setContentError("");
      }
    }

    if (!ok) {
      scrollToFirstError(next);
    } else if (!blocksOk) {
      scrollToFirstBlockError(contentBlocks, validateContentBlocks(contentBlocks));
      document.getElementById("content-blocks")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return ok && blocksOk;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (showSlugPrompt) {
      toast.warning("Please choose whether to keep or update the blog URL");
      document.getElementById("slug-prompt")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const metaWithoutImages = { ...meta };
    delete metaWithoutImages.og_image;
    delete metaWithoutImages.twitter_image;

    // ✅ split blocks into a JSON-safe payload + a flat, ordered list of new
    // gallery files. Existing images keep their path; new ones become an
    // empty placeholder ("") whose file is appended to blockGalleryImages
    // in the SAME left-to-right order — the backend consumes them in lockstep.
    const galleryFilesInOrder: File[] = [];
    const blocksForPayload = contentBlocks.map((block) => {
      if (block.type !== "gallery") return block;
      const images = (block.images || []).map((img) => {
        if (img.image) return { image: img.image, caption: img.caption };
        if (img.file) galleryFilesInOrder.push(img.file);
        return { image: "", caption: img.caption };
      });
      return { blockId: block.blockId, type: "gallery", images };
    });

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("author", author);
    fd.append("shortDescription", shortDesc);
    fd.append("contentBlocks", JSON.stringify(blocksForPayload));
    fd.append("readTime", String(readTime));
    if (views !== "") fd.append("views", String(views));
    fd.append("status", String(isActive));
    fd.append("publicationStatus", publicationStatus);
    fd.append("relatedCaseStudies", JSON.stringify(relatedCaseStudies));
    fd.append("services",           JSON.stringify(selectedServices));
    if (isEditMode && originalPublicationStatus === "published") {
      fd.append("updateLastContentDate", String(updateLastContentDate));
    }
    fd.append("existingImage", existingImage);
    fd.append("meta", JSON.stringify(metaWithoutImages));

    if (imageFile) fd.append("image", imageFile);
    if (meta.og_image instanceof File) fd.append("og_image", meta.og_image);
    if (meta.twitter_image instanceof File) fd.append("twitter_image", meta.twitter_image);
    for (const f of galleryFilesInOrder) fd.append("blockGalleryImages", f);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateBlogApi(id, fd);
        toast.success("Blog updated");
      } else {
        await add_blog_Api(fd);
        toast.success(publicationStatus === "published" ? "Blog published" : "Blog saved as draft");
      }
      navigate("/admin-dash/blog");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(err?.response?.data?.message || "A blog with this slug already exists");
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
          <p className="text-muted mb-0">Loading blog...</p>
        </div>
      </div>
    );
  }

  const authorOptions = authors.map((a) => ({ value: a._id, label: a.name }));
  const selectedAuthor = authorOptions.find((o) => o.value === author) ?? null;
  const shownImage = imagePreview || (existingImage ? imgSrc(existingImage) : "");
  const showLastUpdatedOptIn = isEditMode && originalPublicationStatus === "published";

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Blog" : "Add Blog"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/blog")}>
          ← Back to Blogs
        </button>
      </div>

      <div className="p-md-2 mb-4">

        {/* ── Title / Author ── */}
        <div className="row">
          <div className="col-md-6">
            <label htmlFor="title" className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              className={`form-control mb-1 ${errors.title ? "is-invalid" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="author" className="form-label">
              Author <span className="text-danger">*</span>
            </label>
            <Select
              inputId="author"
              options={authorOptions}
              value={selectedAuthor}
              onChange={(selected) => setAuthor(selected?.value ?? "")}
              isSearchable
              placeholder="Select author"
              classNamePrefix="react-select"
            />
            {errors.author && <div className="text-danger mt-1 small">{errors.author}</div>}
          </div>
        </div>

        {/* ── PUBLISHING ── */}
        <div className="card mt-3 border-0 shadow-sm">
          <div className="card-header fw-semibold bg-light">Publishing</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Publication Status</label>
                <select
                  className="form-control"
                  value={publicationStatus}
                  onChange={(e) => setPublicationStatus(e.target.value as BlogPublicationStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <small className="text-muted">
                  Drafts are only visible in the admin panel and never appear on the site.
                </small>
              </div>

              <div className="col-md-4">
                <label className="form-label">Visibility</label>
                <select
                  className="form-control"
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <small className="text-muted">
                  Only matters once published — lets you temporarily hide a published blog
                  without moving it back to draft.
                </small>
              </div>

              {isEditMode && (
                <div className="col-md-4">
                  <label className="form-label d-block">Editorial dates</label>
                  <div className="small text-muted">Published: {formatDate(publishedAt)}</div>
                  <div className="small text-muted">Last updated (public): {formatDate(lastContentUpdatedAt)}</div>
                </div>
              )}
            </div>

            {showLastUpdatedOptIn && (
              <div className="mt-3">
                <label className="form-check-label d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={updateLastContentDate}
                    onChange={(e) => setUpdateLastContentDate(e.target.checked)}
                  />
                  Update the public &quot;Last Updated&quot; date with this edit
                </label>
                <small className="text-muted d-block mt-1">
                  Leave unchecked for minor changes (SEO, visibility) that shouldn&apos;t change
                  the date readers see. The internal audit trail is always kept either way.
                </small>
              </div>
            )}
          </div>
        </div>

        {/* slug prompt */}
        {showSlugPrompt && (
          <div id="slug-prompt" className="alert alert-info mt-2">
            <p className="mb-2 fw-semibold">
              The title change affects this blog's URL. What would you like to do?
            </p>
            <p className="mb-1 small">Current URL: <code>/{originalSlug}</code></p>
            <p className="mb-3 small">New URL: <code>/{proposedSlug}</code></p>
            <div className="d-flex gap-2 flex-wrap">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleKeepOldSlug}>
                Keep old URL
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={handleUpdateSlug}>
                Update URL (old link will redirect)
              </button>
            </div>
          </div>
        )}

        {/* ── Short description ── */}
        <label htmlFor="shortDesc" className="form-label mt-3">
          Short description <span className="text-danger">*</span>
        </label>
        <textarea
          id="shortDesc"
          className={`form-control mb-1 ${errors.shortDesc ? "is-invalid" : ""}`}
          value={shortDesc}
          rows={3}
          onChange={(e) => setShortDesc(e.target.value)}
        />
        {errors.shortDesc && <div className="invalid-feedback">{errors.shortDesc}</div>}

        {/* ── Read Time + View Count ── */}
        <div className="row mt-3">
          <div className="col-md-2">
            <label htmlFor="readTime" className="form-label">
              Read Time (min) <span className="text-danger">*</span>
            </label>
            <input
              id="readTime"
              type="number"
              min={1}
              className="form-control"
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="views" className="form-label">
              View Count{" "}
              <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span>
            </label>
            <input
              id="views"
              type="number"
              min={0}
              className="form-control"
              placeholder="e.g. 12500"
              value={views}
              onChange={(e) =>
                setViews(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            <small className="text-muted">Hidden if empty</small>
          </div>
           <div className="col-md-4">
                <label className="form-label">Services</label>
                <Select isMulti options={serviceOptions}
                  value={serviceOptions.filter((o) => selectedServices.includes(o.value))}
                  onChange={(v) => setSelectedServices(v.map((o) => o.value))}
                  placeholder="Select services" classNamePrefix="react-select" />
              </div>
        </div>
         <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-header fw-semibold bg-light">Related Case Studies</div>
                  <div className="card-body">
                    <Select isMulti options={caseStudyOptions}
                      value={caseStudyOptions.filter((o) => relatedCaseStudies.includes(o.value))}
                      onChange={(v) => setRelatedCaseStudies(v.map((o) => o.value))}
                      placeholder="Select related case studies" classNamePrefix="react-select" />
                  </div>
                </div>

        {/* ── Featured image ── */}
        <div className="mt-3">
          <h6>Blog Image <span className="text-danger">*</span></h6>
          <p className="text-muted" style={{ fontSize: "13px" }}>
            Allowed types: jpg, jpeg, png, webp · Max 2 MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }}
          />

          {shownImage ? (
            <div className="d-flex align-items-center gap-3">
              <img
                src={shownImage}
                alt="Blog"
                className="img-thumbnail"
                style={{ width: "180px", height: "120px", objectFit: "cover" }}
              />
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change image
                </button>
                {imageFile && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                  >
                    Remove new image
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`upload-box text-center p-5 border ${errors.image ? "border-danger" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="mb-1">Click to select image</p>
              <h4>+</h4>
            </div>
          )}
          {errors.image && <div className="text-danger mt-1">{errors.image}</div>}
        </div>

        {/* ── BLOCK-BASED CONTENT ── */}
        <div className="mt-4" id="content-blocks">
          <h6>
            Content <span className="text-danger">*</span>{" "}
            <span className="text-muted" style={{ fontSize: "12px" }}>
              (build the article from Editor, Gallery, YouTube Video, and Quote blocks — drag to reorder)
            </span>
          </h6>
          <ContentBlockEditor
            blocks={contentBlocks}
            onChange={setContentBlocks}
            onRemoveExistingGalleryImage={handleRemoveExistingGalleryImage}
            error={contentError}
            blockErrors={blockErrors}
          />
        </div>

        {/* ── SEO ── */}
        <div className="mt-5">
          <SeoPreview
            value={meta}
            onChange={(next) => {
              setMeta(next);
              if (next.slug !== meta.slug) {
                setSlugDecisionMade(true);
                setShowSlugPrompt(false);
              }
            }}
            baseUrl="https://test.boilerplate.pbsmokeup.in/"
            onManualEdit={(field) => {
              if (field === "slug") setSlugManuallyEdited(true);
              if (field === "meta_title") setMetaTitleManuallyEdited(true);
              if (field === "meta_description") setMetaDescManuallyEdited(true);
            }}
          />
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Blog"
              : publicationStatus === "published"
              ? "Publish Blog"
              : "Save Draft"}
          </button>
          {isEditMode && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/admin-dash/blog")}
              disabled={loading}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}