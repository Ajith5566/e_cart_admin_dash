import  { useEffect, useState } from 'react'
import "react-quill-new/dist/quill.snow.css";
import { lazy, Suspense } from "react";
import { toast } from 'react-toastify';
import { addPageApi, updatePageApi } from '../services/allAPi';
import { Modules } from './quillmodule';
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

      /* ---------- ADD / UPDATE ---------- */
    
      const handleSubmit = async () => {
        if (!title.trim() || !shortDesc.trim() || !description.trim()) {
          toast.error("All fields are required");
          return;
        }
    
        try {
          setLoading(true);
    
          if (editingPage) {
      await updatePageApi(editingPage._id, {
        title: title.trim(),
        shortDescription: shortDesc.trim(),
        description,
      });
      toast.success("Page updated");
    } else {
      await addPageApi({
        title: title.trim(),
        shortDescription: shortDesc.trim(),
        description,
      });
      toast.success("Page added");
          }
    
          cancelEdit();
        } catch {
          toast.error("Action failed");
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
        setEditingPage(null);
        setTitle("");
        setShortDesc("");
        setDescription("");
      };
  return (
    <>  
        <div className='p-5'>
            
           <div className='d-flex justify-content-between'> 
                <h2 className="mb-4 fw-bold">Add Pages</h2>
                <button
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate("/admin-dash/pages")}
                    >
                    ← Back to Pages
                </button>
           </div>
            
            
                  {/* ---------- FORM ---------- */}
                  <div className="card p-4 mb-4">
                    {editingPage && (
                      <div className="alert alert-warning py-2">
                        Editing page: <strong>{editingPage.title}</strong>
                      </div>
                    )}
            
                    <input
                      className="form-control mb-3"
                      placeholder="Page title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
            
                    <textarea
                      className="form-control mb-3"
                      placeholder="Short description"
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                    />
            
                    <Suspense fallback={<div>Loading editor...</div>}>
                        <ReactQuill
                            value={description}
                            onChange={setDescription}
                            modules={Modules}
                            theme="snow"
                            />
                     </Suspense>
            
            
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