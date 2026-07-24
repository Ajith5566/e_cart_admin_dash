// components/blogs/Add_blog.tsx — updated with quote + readTime + youtubeUrl
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import {
  add_blog_Api,
  getAllauthorsApi,
  getBlogByIdApi,
  updateBlogApi,
} from "../../services/allAPi";
import { Modules } from "../quillmodule";
import { useNavigate, useParams } from "react-router-dom";
import type { MetaFields } from "../../types/types";
import type { AuthorResponse } from "../../types/author_types";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";
import { imgSrc } from "../../utils/imgSrc";
import Select from "react-select";

const ReactQuill = lazy(() => import("react-quill-new"));

// minimal quill config for the quote — no images, just basic formatting
const QuoteModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

export default function Add_blog() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [quote, setQuote] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [readTime, setReadTime] = useState(1);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    description: "",
    image: "",
    youtubeUrl: "",
    readTime: "",
  });

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
        const blog = res.data.data ?? res.data;

        setTitle(blog.title ?? "");
        setAuthor(blog.author?._id ?? "");
        setShortDesc(blog.shortDescription ?? "");
        setDescription(blog.description ?? "");
        setQuote(blog.quote ?? "");
        setYoutubeUrl(blog.youtubeUrl ?? "");
        setReadTime(blog.readTime ?? 1);
        setStatus(blog.isActive);
        setExistingImage(blog.image ?? "");

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

  const isEditorEmpty = (html: string) =>
    html.replace(/<[^>]+>/g, "").trim().length === 0;

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

  const validateForm = () => {
    const next = {
      title: "", author: "", shortDesc: "", description: "",
      image: "", youtubeUrl: "", readTime: "",
    };
    let ok = true;

    if (!title.trim()) { next.title = "Title is required"; ok = false; }
    if (!author) { next.author = "Author is required"; ok = false; }
    if (!shortDesc.trim()) { next.shortDesc = "Short description is required"; ok = false; }
    if (!description.trim() || description === "<p><br></p>" || isEditorEmpty(description)) {
      next.description = "Description is required"; ok = false;
    }
    if (!imageFile && !existingImage) { next.image = "Blog image is required"; ok = false; }
    if (youtubeUrl.trim() && !youtubeRegex.test(youtubeUrl.trim())) {
      next.youtubeUrl = "Please enter a valid YouTube URL"; ok = false;
    }
    if (!readTime || readTime < 1) {
      next.readTime = "Read time must be at least 1 minute"; ok = false;
    }

    setErrors(next);
    return ok;
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

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("author", author);
    fd.append("shortDescription", shortDesc);
    fd.append("description", description);
    fd.append("quote", quote);
    fd.append("youtubeUrl", youtubeUrl.trim());
    fd.append("readTime", String(readTime));
    fd.append("status", String(status));
    fd.append("existingImage", existingImage);
    fd.append("meta", JSON.stringify(metaWithoutImages));

    if (imageFile) fd.append("image", imageFile);
    if (meta.og_image instanceof File) fd.append("og_image", meta.og_image);
    if (meta.twitter_image instanceof File) fd.append("twitter_image", meta.twitter_image);

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateBlogApi(id, fd);
        toast.success("Blog updated");
      } else {
        await add_blog_Api(fd);
        toast.success("Blog added");
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

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Blog" : "Add Blog"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/blog")}>
          ← Back to Blogs
        </button>
      </div>

      <div className="p-md-2 mb-4">

        {/* ── Title / Author / Status ── */}
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

          <div className="col-md-3">
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

          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Draft</option>
            </select>
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

        {/* ── Read Time + YouTube ── */}
        <div className="row mt-3">
          <div className="col-md-3">
            <label htmlFor="readTime" className="form-label">
              Read Time (minutes) <span className="text-danger">*</span>
            </label>
            <input
              id="readTime"
              type="number"
              min={1}
              className={`form-control ${errors.readTime ? "is-invalid" : ""}`}
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
            />
            {errors.readTime && <div className="invalid-feedback">{errors.readTime}</div>}
          </div>

          <div className="col-md-9">
            <label htmlFor="youtubeUrl" className="form-label">
              YouTube URL{" "}
              <span className="text-muted" style={{ fontSize: "12px" }}>(optional)</span>
            </label>
            <input
              id="youtubeUrl"
              type="url"
              className={`form-control ${errors.youtubeUrl ? "is-invalid" : ""}`}
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            {errors.youtubeUrl && <div className="invalid-feedback">{errors.youtubeUrl}</div>}
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

        {/* ── Main description ── */}
        <div className="mt-3" id="description">
          <h6>Description <span className="text-danger">*</span></h6>
          <Suspense fallback={<div>Loading editor...</div>}>
            <ReactQuill
              className="custom-quill"
              value={description}
              onChange={setDescription}
              modules={Modules}
              theme="snow"
            />
          </Suspense>
          {errors.description && <div className="text-danger mt-1">{errors.description}</div>}
        </div>

        {/* ── Quote (Quill, minimal toolbar) ── */}
        <div className="mt-4">
          <h6>
            Quote{" "}
            <span className="text-muted" style={{ fontSize: "12px" }}>
              (optional — highlight quote shown in the blog)
            </span>
          </h6>
          <Suspense fallback={<div>Loading editor...</div>}>
            <ReactQuill
              className="custom-quill"
              value={quote}
              onChange={setQuote}
              modules={QuoteModules}
              theme="snow"
              placeholder="Enter a highlight quote..."
            />
          </Suspense>
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
            {loading ? "Saving..." : isEditMode ? "Update Blog" : "Add Blog"}
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