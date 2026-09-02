// components/pages/Add_page.tsx — with keep/update slug prompt
// (pairs with the fixed pageController: backend uses meta.slug as the decision)
import { useEffect, useState, lazy, Suspense } from 'react'
import "react-quill-new/dist/quill.snow.css";
import { toast } from 'react-toastify';
import { addPageApi, getPageByIdApi, updatePageApi } from '../../services/allAPi';
import { useNavigate, useParams } from "react-router-dom";
import type { MetaFields } from '../../types/types';
import SeoPreview from '../seo/Seo';
import slugify from "slugify";

type PageType = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
  meta?: MetaFields;
};
// before

const RichEditor = lazy(() => import('../editor/TiptapEditor'));


function Add_page() {

  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [editingPage, setEditingPage] = useState<PageType | null>(null);
  const [loading, setLoading] = useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
  const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
  const [meta, setMeta] = useState<MetaFields>({});

  // ✅ slug-change prompt state
  const [originalSlug, setOriginalSlug] = useState("");       // slug live in DB
  const [proposedSlug, setProposedSlug] = useState("");       // slug the new title generates
  const [showSlugPrompt, setShowSlugPrompt] = useState(false);
  const [slugDecisionMade, setSlugDecisionMade] = useState(false);

  const [loadingData, setLoadingData] = useState(!!id);

  // ✅ Fetch page by ID from API (refresh-safe)
  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchPage = async () => {
      try {
        const res = await getPageByIdApi(id);
        const page: PageType = res.data;

        setEditingPage(page);
        setTitle(page.title);
        setShortDesc(page.shortDescription);
        setDescription(page.description);

        if (page.meta && Object.keys(page.meta).length > 0) {
          setMeta(page.meta);
          // ✅ prefer meta.slug; fall back to the page's own slug field
          setOriginalSlug(page.meta.slug || page.slug || "");
          setSlugManuallyEdited(true);
          setMetaTitleManuallyEdited(true);
          setMetaDescManuallyEdited(true);
        } else {
          // ✅ page exists but has no meta yet — the page slug is still
          // the live URL and must be protected by the prompt
          setMeta({ slug: page.slug });
          setOriginalSlug(page.slug || "");
          setSlugManuallyEdited(true);
        }
      } catch {
        toast.error("Failed to load page");
        navigate("/admin-dash/pages");
      } finally {
        setLoadingData(false);
      }
    };

    fetchPage();
  }, [id]);

  useEffect(() => {
    if (!title) return;

    const generatedSlug = slugify(title, { lower: true, strict: true, trim: true });

    // ✅ EDIT MODE: never silently change the slug — ask instead
    if (isEditMode && originalSlug && !slugDecisionMade) {
      if (generatedSlug !== originalSlug) {
        setProposedSlug(generatedSlug);
        setShowSlugPrompt(true);
      } else {
        // title typed back to the original → dismiss prompt
        setShowSlugPrompt(false);
        setProposedSlug("");
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta((prev) => ({
      ...prev,
      // ADD MODE: auto-slug as before. EDIT MODE: slug only changes
      // through the prompt buttons or a manual SeoPreview edit.
      slug: isEditMode || slugManuallyEdited
        ? prev.slug
        : generatedSlug,
      meta_title: metaTitleManuallyEdited ? prev.meta_title : title,
      meta_description: metaDescManuallyEdited
        ? prev.meta_description
        : shortDesc,
    }));
  }, [title, shortDesc, slugManuallyEdited, metaTitleManuallyEdited, metaDescManuallyEdited, isEditMode, originalSlug, slugDecisionMade]);

  // ✅ user chose to KEEP the old slug
  const handleKeepOldSlug = () => {
    setMeta((prev) => ({ ...prev, slug: originalSlug }));
    setShowSlugPrompt(false);
    setSlugDecisionMade(true);
    setSlugManuallyEdited(true);
    toast.info("Old URL will be kept");
  };

  // ✅ user chose to UPDATE the slug
  // (backend archives the old slug to SlugHistory → old links redirect)
  const handleUpdateSlug = () => {
    setMeta((prev) => ({ ...prev, slug: proposedSlug }));
    setShowSlugPrompt(false);
    setSlugDecisionMade(true);
    setSlugManuallyEdited(true);
    toast.info("URL will be updated. Old links will redirect automatically.");
  };

 /*  const isEditorEmpty = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length === 0;
  }; */

  const [errors, setErrors] = useState({
    title: "",
    shortDesc: "",
  });

  const validateForm = () => {
    const newErrors = { title: "", shortDesc: "", description: "" };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (shortDesc.length > 150) {
      newErrors.shortDesc = "Short description cannot exceed 150 characters";
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // ✅ block submit while the slug question is unanswered
    if (showSlugPrompt) {
      toast.warning("Please choose whether to keep or update the page URL");
      document.getElementById("slug-prompt")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const metaWithoutImages = { ...meta };
    delete metaWithoutImages.og_image;
    delete metaWithoutImages.twitter_image;

    const fd = new FormData();
    fd.append("title", title);
    fd.append("shortDescription", shortDesc);
    fd.append("description", description);
    fd.append("meta", JSON.stringify(metaWithoutImages));

    if (meta.og_image instanceof File) fd.append("og_image", meta.og_image);
    if (meta.twitter_image instanceof File) fd.append("twitter_image", meta.twitter_image);

    try {
      setLoading(true);

      if (editingPage) {
        await updatePageApi(editingPage._id, fd);
        toast.success("Page updated");
      } else {
        await addPageApi(fd);
        toast.success("Page added");
      }

      navigate("/admin-dash/pages");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // backend sends 409 both for duplicate titles and taken slugs
        toast.error(err?.response?.data?.message || "Page title or slug already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => navigate('/admin-dash/pages');

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex justify-content-between">
          <h4 className="fw-bold">{isEditMode ? "Edit Page" : "Add Page"}</h4>
          <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/pages")}>
            ← Back to Pages
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">

      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit Page" : "Add Page"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/pages")}>
          ← Back to Pages
        </button>
      </div>

      <div className="p-md-2 mb-4">
        {editingPage && (
          <div className="alert alert-warning py-2">
            Editing page: <strong>{editingPage.title}</strong>
          </div>
        )}

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

        {/* ✅ SLUG CHANGE PROMPT */}
        {showSlugPrompt && (
          <div id="slug-prompt" className="alert alert-info mt-2">
            <p className="mb-2 fw-semibold">
              The title change affects this page's URL. What would you like to do?
            </p>
            <p className="mb-1 small">
              Current URL: <code>/{originalSlug}</code>
            </p>
            <p className="mb-3 small">
              New URL: <code>/{proposedSlug}</code>
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleKeepOldSlug}
              >
                Keep old URL
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleUpdateSlug}
              >
                Update URL (old link will redirect)
              </button>
            </div>
          </div>
        )}

        <label htmlFor="shortDesc" className="form-label mt-3">
          Short description 
        </label>
        <textarea
          id="shortDesc"
          className={`form-control mb-1 ${errors.shortDesc ? "is-invalid" : ""}`}
          value={shortDesc}
          maxLength={150}
          onChange={(e) => setShortDesc(e.target.value)}
        />
        {errors.shortDesc && <div className="invalid-feedback">{errors.shortDesc}</div>}

<div className="mt-3" id="description">
  <h6>Description</h6>
  <Suspense fallback={<div>Loading editor...</div>}>
    <RichEditor
      value={description}
      onChange={setDescription}
      placeholder="Write description..."
      minHeight={200}
    />
  </Suspense>
</div>

        <div className="mt-5">
          <SeoPreview
            value={meta}
            onChange={(next) => {
              setMeta(next);
              // ✅ manual slug edit in SeoPreview counts as the decision
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
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {editingPage ? "Update Page" : "Add Page"}
          </button>

          {editingPage && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={cancelEdit}
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

export default Add_page;