/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Modules } from "../quillmodule";
import {
    add_author_Api,
  updateAuthorApi,
} from "../../services/allAPi";
import type { AuthorResponse, AuthorTypes } from "../../types/author_types";

const ReactQuill = lazy(() => import("react-quill-new"));

function Add_blog_author() {
  /*  const [_blogs, setBlogs] = useState<BlogResponse[]>([]); */
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const author: AuthorResponse | undefined = location.state?.author;
  console.log(author);


  const isEditMode = !!author;
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);




  const [formData, setFormData] = useState<AuthorTypes>({
      name: "",
  description: "",
   tagline:"",
  linkedin: "",
  instagram: "",
  facebook: "",
  youtube: "",
    status: true,
    image: null,
  });

  const [errors, setErrors] = useState({ name: ""});


   // Prefill form in edit mode
  useEffect(() => {
    if (!author) return;

    setFormData({
      name: author.name,
      tagline: author.tagline || "",
      description: author.description || "",
      status: author.isActive,
      image: null,
      linkedin:author.linkedin,
      facebook:author.facebook,
      instagram:author.instagram,
      youtube:author.youtube
    });

    if (author.image) {
      setExistingImages([author.image]);
    }

},[author]);

  const validateForm = () => {
    const newErrors = { name: "", };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Author name is required";
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

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("tagline", formData.tagline.trim() || "");
      payload.append("description", formData.description);
      payload.append("instagram", formData.instagram || "");
      payload.append("linkedin", formData.linkedin || "");
      payload.append("facebook", formData.facebook || "");
      payload.append("youtube", formData.youtube || "");
      payload.append("status", String(formData.status));
      payload.append("existingImage", existingImages[0] || "");


      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (isEditMode) {
        await updateAuthorApi(author._id, payload);
        toast.success("author updated");
      } else {
        await add_author_Api(payload);
        toast.success("author added successfully");
      }

      navigate("/admin-dash/blogAuthor");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("Author already exists");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">
          {isEditMode ? "Edit blog" : "Add Author"}
        </h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin-dash/blogAuthor")}
        >
          ← Back to Authors
        </button>
      </div>

      <div className="row mt-2">

        {/* LEFT */}
        <div className="col-md-9 col-12 p-4">

         <div className="row">
              {/* NAME */}
             <div className="col-md-6">
                  <label className="form-label">
                    Author Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
        
             </div>
              <div className="col-md-6">
                  {/* PARENT CATEGORY */}
                  <label htmlFor="tagline" className="form-label">
                    Tagline
                  </label>
                  <input
                    id="tagline"
                    value={formData.tagline}
                    className="form-control"
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                  />
              </div>
         </div>

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
          <div className="row mt-3">
              {/* NAME */}
             <div className="col-md-6">
                  <label className="form-label">
                    Linkedin 
                  </label>
                  <input
                    id="linkedin"
                    className="form-control"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                  />
                 
        
             </div>
              <div className="col-md-6">
                  
                  <label htmlFor=" instagram" className="form-label">
                    Instagram
                  </label>
                  <input
                    id="instagram"
                    value={formData.instagram}
                    className="form-control"
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                  />
                 
              </div>
         </div>
         <div className="row mt-3">
              
             <div className="col-md-6">
                  <label className="form-label">
                    Facebook 
                  </label>
                  <input
                    id="facebook"
                    className="form-control"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                  />
                 
        
             </div>
              <div className="col-md-6">
                
                  <label htmlFor="youtube" className="form-label">
                    Youtube
                  </label>
                  <input
                    id="youtube"
                   className="form-control"
                    value={formData.youtube}
                    onChange={(e) =>
                      setFormData({ ...formData, youtube: e.target.value })
                    }
                  />
                 
              </div>
         </div>


        </div>


        {/* RIGHT */}
        <div className="col-md-3 col-12 p-md-4 p-2">

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
              Preferred dimension is 650px x 450px
Allowed file types are jpg, jpeg, png, webp
Maximum allowed file size is 2 MB
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
       {/* SUBMIT */}
      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {isEditMode ? "Update author" : "Add author"}
        </button>
      </div>

    </div>
  );
}

export default Add_blog_author;