
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { type AxiosResponse } from "axios";
import "react-quill-new/dist/quill.snow.css";
/* import { lazy, Suspense } from "react";
import { Modules } from "./quillmodule"; */
import { /* addPageApi */ deletePageApi, getAllPagesApi, togglePageApi, /* updatePageApi */ } from "../services/allAPi";
import { useNavigate } from "react-router-dom";
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

/* 
const ReactQuill = lazy(() => import("react-quill-new")); */

/* -------------------- COMPONENT -------------------- */

export default function PageEditor() {
   const navigate = useNavigate();
  /* ---------- STATE ---------- */

  const [pages, setPages] = useState<PageType[]>([]);
/*   const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [editingPage, setEditingPage] = useState<PageType | null>(null); */


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- FETCH PAGES ---------- */

  const fetchPages = useCallback(async () => {
  try {
    setLoading(true);

    const res = (await getAllPagesApi(
      page
    )) as AxiosResponse<GetPagesResponse>;

    setPages(res.data.docs);
    setTotalPages(res.data.totalPages);
  } catch {
    toast.error("Failed to fetch pages");
  } finally {
    setLoading(false);
  }
}, [page]);

useEffect(() => {
  fetchPages();
}, [fetchPages]);

  /* ---------- ADD / UPDATE ---------- */

  /* const handleSubmit = async () => {
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

        fetchPages();
      }

      cancelEdit();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  }; */

  /* ---------- EDIT ---------- */

/*   const handleEdit = (p: PageType) => {
    setEditingPage(p);
    setTitle(p.title);
    setShortDesc(p.shortDescription);
    setDescription(p.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 */
  /* ---------- CANCEL EDIT ---------- */

  /* const cancelEdit = () => {
    setEditingPage(null);
    setTitle("");
    setShortDesc("");
    setDescription("");
  }; */

  /* -------------------- UI -------------------- */

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Manage Pages</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin-dash/pages/add")}

        >
          + Add Page
        </button>
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
                      togglePageApi(p._id).then(fetchPages)
                    }
                  />
                </td>
                <td className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                   onClick={() =>
    navigate("/admin-dash/pages/add", {
      state: { page: p },
    })
  }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      deletePageApi(p._id).then(fetchPages)
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
