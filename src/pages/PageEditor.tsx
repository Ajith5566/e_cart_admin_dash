import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { AxiosResponse } from "axios";
import {
  deletePageApi,
  getAllPagesApi,
  togglePageApi,
} from "../services/allAPi";
import { useNavigate } from "react-router-dom";
import ProductSearch from "../components/Search_bar";
import Pagination from "../components/Pagination";

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
};

/* -------------------- COMPONENT -------------------- */

export default function PageEditor() {
  const navigate = useNavigate();

  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

  /* ---------- FETCH PAGES ---------- */

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);

      const res = (await getAllPagesApi(
        page,5,search
      )) as AxiosResponse<GetPagesResponse>;

      setPages(res.data.docs);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  }, [page,search]);


  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search]);
  /* -------------------- UI -------------------- */

  return (
    <div className="container p-4" >
      <div className="d-flex justify-content-end p-3 " >
          <button
          className="btn btn-primary"
          onClick={() => navigate("/admin-dash/pages/add")}
        >
          + Add Page
        </button>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Manage Pages</h2>
         <ProductSearch value={search} onChange={setSearch} />
      </div>

      {/* ---------- PAGE LIST ---------- */}
      <div style={{minHeight:"420px"}}>
        <table className="table table-bordered align-middle"  >
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
                      checked={!!p.isActive}
                      onChange={async () => {
                        try {
                          await togglePageApi(p._id);
                          fetchPages();
                        } catch {
                          toast.error("Status update failed");
                        }
                      }}
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
                      onClick={async () => {
                        if (!window.confirm("Delete this page?")) return;
                        await deletePageApi(p._id);
                        fetchPages();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  {loading ? "Loading..." : "No pages found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className="d-flex justify-content-center align-items-center mt-3">
         <Pagination
          currentPage={page}
          totalPages={totalPages}
          onChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
