/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Modules } from "../quillmodule";
import type { BlogResponse, BlogTypes, MetaFields } from "../../types/types";
import {
  add_blog_Api,
  updateBlogApi,
} from "../../services/allAPi";
import SeoPreview from "../seo/Seo";
import slugify from "slugify";

const ReactQuill = lazy(() => import("react-quill-new"));

function Add_blog() {
 /*  const [_blogs, setBlogs] = useState<BlogResponse[]>([]); */
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const blog: BlogResponse | undefined = location.state?.blog;
  console.log(blog);
  

  const isEditMode = !!blog;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [metaTitleManuallyEdited, setMetaTitleManuallyEdited] = useState(false);
    const [metaDescManuallyEdited, setMetaDescManuallyEdited] = useState(false);
    const [meta, setMeta] = useState<MetaFields>({});
  
  

  const [formData, setFormData] = useState<BlogTypes>({
    title: "",
    author: "",
    shortDescription: "",
    description: "",
    status: true,
    image: null,
  });

  const [errors, setErrors] = useState({ name: "" ,author:""});
  
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
  

  // Prefill form in edit mode
   useEffect(() => {
    if (!blog) return;

    setFormData({
      title: blog.title,
      // parent_blog is a populated object, extract _id for the select value
      author: blog.author || "",
      shortDescription: blog.shortDescription || "",
      description: blog.description || "",
      status: blog.isActive,
      image: null,
    });

    if (blog.image) {
      setExistingImages([blog.image]);
    }

    // ✅ pre-fill meta when editing
    if (blog.meta && Object.keys(blog.meta).length > 0) {
      setMeta(blog.meta);
      // ✅ mark as manually edited so auto-fill doesn't overwrite
      setSlugManuallyEdited(true);
      setMetaTitleManuallyEdited(true);
      setMetaDescManuallyEdited(true);
    }

  }, [blog]);

  const validateForm = () => {
    const newErrors = { name: "" ,author:""};
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

     // NEW FEATURE — scroll to first error
        if (!isValid) {
    scrollToFirstError(newErrors);
}
    return isValid;
  };


   //focus effect
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

     // ── build meta without image files — strip them out ──
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
      payload.append("meta", JSON.stringify(metaWithoutImages)); // ✅ no File objects inside

      if (formData.image) {
        payload.append("image", formData.image);
      }
        if (meta.og_image instanceof File) {
      payload.append("og_image", meta.og_image);         // ✅ separate field
    }

    if (meta.twitter_image instanceof File) {
      payload.append("twitter_image", meta.twitter_image); // ✅ separate field
    }

      if (isEditMode) {
        await updateBlogApi(blog._id, payload);
        toast.success("Blog updated");
      } else {
        await add_blog_Api(payload);
        toast.success("blog added");
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

  return (
    <div className="p-5">

      {/* HEADER */}
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">
          {isEditMode ? "Edit blog" : "Add blog"}
        </h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/blog")}
        >
          ← Back to blogs
        </button>
      </div>

      <div className="row mt-5">

        {/* LEFT */}
        <div className="col-9 p-4">

          {/* NAME */}
          <label className="form-label">
            Title <span className="text-danger">*</span>
          </label>
          <input
          id="name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name}</div>
          )}

          {/* PARENT CATEGORY */}
          <label htmlFor="author" className="form-label mt-3">
            Author<span className="text-danger">*</span>
          </label>
          <input
            id="author"
            className={`form-control ${errors.author ? "is-invalid" : ""}`}
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
          />
             {errors.author && (
            <div className="invalid-feedback">{errors.author}</div>
          )}


          {/* SHORT DESC */}
          <label className="form-label mt-4">Short Description</label>
          <textarea
            className="form-control"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
          />

          {/* DESCRIPTION */}
          <div className="mt-4">
            <h6>Description</h6>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
                className="custom-quill"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                modules={Modules}
                theme="snow"
              />
            </Suspense>
          </div>

          
        </div>


        {/* RIGHT */}
        <div className="col-3 p-4">

          {/* STATUS */}
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={formData.status ? "true" : "false"}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value === "true" })
            }
          >
            <option value="true">Active</option>
            <option value="false">Draft</option>
          </select>

          {/* IMAGE */}
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

            {/* Existing image */}
            {existingImages.map((img) => (
              <div key={img} className="mt-3">
                <img src={img} className="img-thumbnail" alt="existing" />
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={removeExistingImage}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* New image preview */}
            {previewImage && (
              <div className="mt-3">
                <img src={previewImage} className="img-thumbnail" alt="preview" />
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={removeImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
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
        {/* SUBMIT */}
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