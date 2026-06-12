/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom"; // ✅ removed useLocation
import { Modules } from "../quillmodule";
import type { MetaFields } from "../../types/types";
import {
  add_blog_Api,
  getAllauthorsApi,
  getBlogByIdApi,  // ✅ add this
  updateBlogApi,
} from "../../services/allAPi";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";
import type { BlogResponse, BlogTypes } from "../../types/blogTypes";
import type { AuthorResponse } from "../../types/author_types";
import Select from "react-select";

const ReactQuill = lazy(() => import("react-quill-new"));

function Add_blog() {
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { id } = useParams();               // ✅ get id from URL
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
  const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
  const [meta, setMeta] = useState<MetaFields>({});

  const [loadingData, setLoadingData] = useState(!!id); // ✅ based on id

  const [formData, setFormData] = useState<BlogTypes>({
    title: "",
    author: "",
    shortDescription: "",
    description: "",
    status: true,
    image: null,
  });

  const [errors, setErrors] = useState({ name: "", author: "" });

  useEffect(() => {
    if (!formData.title) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta((prev) => ({
      ...prev,
      slug: slugManuallyEdited
        ? prev.slug
        : slugify(formData.title, { lower: true, strict: true, trim: true }),
      meta_title: metaTitleManuallyEdited ? prev.meta_title : formData.title,
      meta_description: metaDescManuallyEdited
        ? prev.meta_description
        : formData.shortDescription,
    }));
  }, [formData.title, formData.shortDescription, slugManuallyEdited, metaTitleManuallyEdited, metaDescManuallyEdited]);

  // ✅ Fetch blog by ID from API (refresh-safe)
  useEffect(() => {
    if (!id) {
      setLoadingData(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        const res = await getBlogByIdApi(id);
        console.log(res.data);

        // ✅ adjust based on your backend response shape
        // if { success: true, data: {...} } → use res.data.data
        // if blog object directly           → use res.data
        const blog: BlogResponse = res.data.data ?? res.data;

        setFormData({
          title: blog.title,
          author: blog.author?._id || "",
          shortDescription: blog.shortDescription || "",
          description: blog.description || "",
          status: blog.isActive,
          image: null,
        });

        if (blog.image) {
          setExistingImages([blog.image]);
        }

        if (blog.meta && Object.keys(blog.meta).length > 0) {
          setMeta(blog.meta);
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
  }, [id]);

  const validateForm = () => {
    const newErrors = { name: "", author: "" };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.name = "Blog title is required";
      isValid = false;
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author name is required";
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

  const removeImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const removeExistingImage = () => {
    setExistingImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const metaWithoutImages = { ...meta };
    delete metaWithoutImages.og_image;
    delete metaWithoutImages.twitter_image;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("shortDescription", formData.shortDescription);
      payload.append("description", formData.description);
      payload.append("author", formData.author || "");
      payload.append("status", String(formData.status));
      payload.append("existingImage", existingImages[0] || "");
      payload.append("meta", JSON.stringify(metaWithoutImages));

      if (formData.image) payload.append("image", formData.image);
      if (meta.og_image instanceof File) payload.append("og_image", meta.og_image);
      if (meta.twitter_image instanceof File) payload.append("twitter_image", meta.twitter_image);

      if (isEditMode) {
        await updateBlogApi(id!, payload); // ✅ use id from URL
        toast.success("Blog updated");
      } else {
        await add_blog_Api(payload);
        toast.success("Blog added");
      }

      navigate("/admin-dash/blog");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("Blog already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await getAllauthorsApi();
        setAuthors(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load authors");
      }
    };
    fetchAuthors();
  }, []);

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex justify-content-between">
          <h4 className="fw-bold">{isEditMode ? "Edit blog" : "Add blog"}</h4>
          <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/blog")}>
            ← Back to blogs
          </button>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit blog" : "Add blog"}</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/admin-dash/blog")}>
          ← Back to blogs
        </button>
      </div>

      <div className="row mt-2">

        {/* LEFT */}
        <div className="col-md-9 col-12 p-4">

          <label className="form-label">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}

          <div className="row">
            <div className="col-12 col-md-6">
              <label htmlFor="author" className="form-label mt-3">
                Author <span className="text-danger">*</span>
              </label>
              <Select
                options={authors.map(author => ({
                  value: author._id,
                  label: author.name,
                }))}
                value={
                  authors
                    .map(author => ({ value: author._id, label: author.name }))
                    .find(option => option.value === formData.author)
                }
                onChange={(selected) =>
                  setFormData({ ...formData, author: selected?.value || "" })
                }
                isSearchable
                className={`form-control mb-1 ${errors.author ? "is-invalid" : ""}`}
              />
              {errors.author && <div className="invalid-feedback">{errors.author}</div>}
            </div>
          </div>

          <label className="form-label mt-4">Short Description</label>
          <textarea
            className="form-control"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />

          <div className="mt-4">
            <h6>Description</h6>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
                className="custom-quill"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                modules={Modules}
                theme="snow"
              />
            </Suspense>
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

          <div className="mt-4">
            <h6>Image</h6>
            <p className="font_small text-justify">
              Preferred dimension is 300px x 450px.
              Allowed file types: jpg, jpeg, png, webp.
              Maximum file size: 2 MB.
            </p>

            <div className="upload-box text-center p-5 border">
              <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                id="imageUpload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFormData((prev) => ({ ...prev, image: file }));
                  setPreviewImage(URL.createObjectURL(file));
                }}
              />
              <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                <p className="text-primary fw-semibold">
                  Click / Drop file here to upload
                </p>
              </label>
            </div>

            {existingImages.map((img) => (
              <div key={img} className="mt-3">
                <img src={img} className="img-thumbnail" alt="existing" />
                <button className="btn btn-danger btn-sm mt-2" onClick={removeExistingImage}>
                  Remove
                </button>
              </div>
            ))}

            {previewImage && (
              <div className="mt-3">
                <img src={previewImage} className="img-thumbnail" alt="preview" />
                <button className="btn btn-danger btn-sm mt-2" onClick={removeImage}>
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 w-100 w-md-100">
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

      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {isEditMode ? "Update blog" : "Add blog"}
        </button>
      </div>

    </div>
  );
}

export default Add_blog;