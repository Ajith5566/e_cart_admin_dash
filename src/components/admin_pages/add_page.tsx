import { useEffect, useState, lazy, Suspense } from 'react'
import "react-quill-new/dist/quill.snow.css";
import { toast } from 'react-toastify';
import { addPageApi, getPageByIdApi, updatePageApi } from '../../services/allAPi'; // ✅ add getPageByIdApi
import { Modules } from '../quillmodule';
import { useNavigate, useParams } from "react-router-dom"; // ✅ removed useLocation
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

const ReactQuill = lazy(() => import("react-quill-new"));

function Add_page() {

  const { id } = useParams();               // ✅ get id from URL
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
          setSlugManuallyEdited(true);
          setMetaTitleManuallyEdited(true);
          setMetaDescManuallyEdited(true);
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta((prev) => ({
      ...prev,
      slug: slugManuallyEdited
        ? prev.slug
        : slugify(title, { lower: true, strict: true, trim: true }),
      meta_title: metaTitleManuallyEdited ? prev.meta_title : title,
      meta_description: metaDescManuallyEdited
        ? prev.meta_description
        : shortDesc,
    }));
  }, [title, shortDesc, slugManuallyEdited, metaTitleManuallyEdited, metaDescManuallyEdited]);

  const isEditorEmpty = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length === 0;
  };

  const [errors, setErrors] = useState({
    title: "",
    shortDesc: "",
    description: "",
  });

  const validateForm = () => {
    const newErrors = { title: "", shortDesc: "", description: "" };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!shortDesc.trim()) {
      newErrors.shortDesc = "Short description is required";
      isValid = false;
    } else if (shortDesc.length > 150) {
      newErrors.shortDesc = "Short description cannot exceed 150 characters";
      isValid = false;
    }

    if (!description.trim() || description === "<p><br></p>" || isEditorEmpty(description)) {
      newErrors.description = "Description is required";
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
        toast.error("Page title already exists");
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

        <label htmlFor="shortDesc" className="form-label mt-3">
          Short description <span className="text-danger">*</span>
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
          {errors.description && (
            <div className="text-danger mt-1">{errors.description}</div>
          )}
        </div>

        <div className="mt-5">
          <SeoPreview
            value={meta}
            onChange={setMeta}
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