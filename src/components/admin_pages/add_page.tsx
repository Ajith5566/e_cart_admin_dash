import { useEffect, useState } from 'react'
import "react-quill-new/dist/quill.snow.css";
import { lazy, Suspense } from "react";
import { toast } from 'react-toastify';
import { addPageApi, updatePageApi } from '../../services/allAPi';
import { Modules } from '../quillmodule';
import { useLocation, useNavigate } from "react-router-dom";
/* -------------------- QUILL -------------------- */

type PageType = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
};
const ReactQuill = lazy(() => import("react-quill-new"));

function Add_page() {

  const location = useLocation();
  const page = location.state?.page;
  const isEditMode = !!page
  const navigate = useNavigate();


  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [editingPage, setEditingPage] = useState<PageType | null>(null);


  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!page) return;

    setEditingPage(page);
    setTitle(page.title);
    setShortDesc(page.shortDescription);
    setDescription(page.description);
  }, [page]);




  /* form validation */
  const [errors, setErrors] = useState({
    title: "",
    shortDesc: "",
    description: "",
  });

  const isEditorEmpty = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length === 0;
  };
  const validateForm = () => {

    const newErrors = {
      title: "",
      shortDesc: "",
      description: "",
    };

    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!shortDesc.trim()) {
      newErrors.shortDesc = "Short description is required";
      isValid = false;
    }else if (shortDesc.length > 150) {
    newErrors.shortDesc = "Short description cannot exceed 150 characters";
    isValid = false;
  }

    if (!description.trim() || description === "<p><br></p>") {
      newErrors.description = "Description is required";
      isValid = false;
    } if (isEditorEmpty(description)) {
      newErrors.description = "Description is required";
      isValid = false;
    }


    setErrors(newErrors);

    return isValid;
  };



  /* ---------- ADD / UPDATE ---------- */

 const handleSubmit = async () => {

  if (!validateForm()) return;

  try {

    setLoading(true);

    if (editingPage) {

      await updatePageApi(editingPage._id, {
        title: title.trim(),
        shortDescription: shortDesc.trim(),
        description,
      });

      toast.success("Page updated");
       navigate("/admin-dash/pages");

    } else {

      await addPageApi({
        title: title.trim(),
        shortDescription: shortDesc.trim(),
        description,
      });

      toast.success("Page added");
      // Redirect after success
      navigate("/admin-dash/pages");

    }

    cancelEdit();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {

    // ⭐ Check backend status
    if (err?.response?.status === 409) {

      toast.error("Page title already exist");

    } else {

      toast.error("Action failed");

    }

  } finally {

    setLoading(false);

  }
};


  /* ---------- EDIT ---------- */

  /*  const handleEdit = (p: PageType) => {
     setEditingPage(p);
     setTitle(p.title);
     setShortDesc(p.shortDescription);
     setDescription(p.description);
     window.scrollTo({ top: 0, behavior: "smooth" });
   };
  */
  /* ---------- CANCEL EDIT ---------- */

  const cancelEdit = () => {
    navigate('/admin-dash/pages')
  };
  return (
    <>
      <div className='p-5'>

        <div className='d-flex justify-content-between'>
          <h2 className="mb-4 fw-bold">
            {isEditMode ? "Edit Page" : "Add Page"}
          </h2>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/admin-dash/pages")}
          >
            ← Back to Pages
          </button>
        </div>


        {/* ---------- FORM ---------- */}
        <div className=" p-4 mb-4">
          {editingPage && (
            <div className="alert alert-warning py-2">
              Editing page: <strong>{editingPage.title}</strong>
            </div>
          )}
          <label htmlFor="title" className='form-label'>Title <span className="text-danger">*</span></label>
          <input
            className={`form-control mb-1 ${errors.title ? "is-invalid" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}

          <label htmlFor="short_description" className='form-label mt-3'>Short description <span className="text-danger">*</span></label>
          <textarea
            className={`form-control mb-1 ${errors.shortDesc ? "is-invalid" : ""}`}
            value={shortDesc}
             maxLength={150}
            onChange={(e) => setShortDesc(e.target.value)}
          />

          {errors.shortDesc && (
            <div className="invalid-feedback">{errors.shortDesc}</div>
          )}


          <div className='mt-3'>
            <h6>Description <span className="text-danger">*</span></h6>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
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
    </>
  )
}

export default Add_page