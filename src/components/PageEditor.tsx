
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { type AxiosResponse } from "axios";
import "react-quill-new/dist/quill.snow.css";
import { lazy, Suspense } from "react";
import { Modules } from "./quillmodule";
import { addPageApi, deletePageApi, getAllPagesApi, togglePageApi, updatePageApi } from "../services/allAPi";

/* -------------------- TYPES -------------------- */

type PageType = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
};

type GetPagesResponse = {
  docs: PageType[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/* -------------------- QUILL -------------------- */


const ReactQuill = lazy(() => import("react-quill-new"));

/* -------------------- COMPONENT -------------------- */

export default function PageEditor() {
  /* ---------- STATE ---------- */

  const [pages, setPages] = useState<PageType[]>([]);
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [editingPage, setEditingPage] = useState<PageType | null>(null);


  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- GET TOKEN ---------- */

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    setToken(storedToken ?? "");
  }, []);

  /* ---------- FETCH PAGES ---------- */

  const fetchPages = useCallback(async () => {
  if (!token) return;

  try {
    setLoading(true);

    const res = (await getAllPagesApi(
      token,
      page,                         
    )) as AxiosResponse<GetPagesResponse>;

    setPages(res.data.docs);
    setTotalPages(res.data.totalPages);
  } catch {
    toast.error("Failed to fetch pages");
  } finally {
    setLoading(false);
  }
}, [token, page]);

useEffect(() => {
  fetchPages();
}, [fetchPages]);

  /* ---------- ADD / UPDATE ---------- */

  const handleSubmit = async () => {
    if (!title.trim() || !shortDesc.trim() || !description.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      if (editingPage) {
        // UPDATE
        await updatePageApi(
          editingPage._id,
          {
            title: title.trim(),
            shortDescription: shortDesc.trim(),
            description,
          },
          token
        );
        toast.success("Page updated");
      } else {
        // ADD
      await addPageApi(
          {
            title: title.trim(),
            shortDescription: shortDesc.trim(),
            description,
          },
          token
        );
    
        
        toast.success("Page added");
        fetchPages();
      }

      cancelEdit();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- EDIT ---------- */

  const handleEdit = (p: PageType) => {
    setEditingPage(p);
    setTitle(p.title);
    setShortDesc(p.shortDescription);
    setDescription(p.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- CANCEL EDIT ---------- */

  const cancelEdit = () => {
    setEditingPage(null);
    setTitle("");
    setShortDesc("");
    setDescription("");
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="container p-4">
      <h2 className="mb-4 fw-bold">Manage Pages</h2>

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

      {/* ---------- PAGE LIST ---------- */}
      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th style={{ width: 200 }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {pages.length ? (
            pages.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.slug}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={p.isActive}
                    onChange={() =>
                      togglePageApi(p._id, token).then(fetchPages)
                    }
                  />
                </td>
                <td className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      deletePageApi(p._id, token).then(fetchPages)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No pages found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------- PAGINATION ---------- */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ◀ Prev
        </button>

        <span>
          Page <strong>{page}</strong> of{" "}
          <strong>{totalPages}</strong>
        </span>

        <button
          className="btn btn-outline-secondary"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
