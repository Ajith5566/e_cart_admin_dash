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
import '../components/common_toggle.css'
import '../components/common_styels.css'
import PaginationLimit from "../components/PaginationLimit";

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
  const [limit, setLimit]=useState(5)

  const [search, setSearch] = useState("");


  /* ---------- FETCH PAGES ---------- */

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);

      const res = (await getAllPagesApi({
        page, limit, search}
      )) as AxiosResponse<GetPagesResponse>;

      setPages(res.data.docs);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  }, [page, search,limit]);


  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    setPage(1);
  }, [search]);
  /* -------------------- UI -------------------- */

  return (
    <div className="container p-4" >
      <div className="p-3">
        <h4 className="  fw-bold text-dark">
          Page
        </h4>
      </div>
      <div className="d-flex justify-content-end p-3 " >
       
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin-dash/pages/add")}
        >
          + Add Page
        </button>
      </div>
      <div className="d-flex justify-content-between mb-3">
         <PaginationLimit limit={limit} onChange={(newLimit)=>{setLimit(newLimit); setPage(1); }}/>
         <div className="d-flex gap-2 justify-content-center align-items-center">
             <h6>Search:</h6>
          <ProductSearch value={search} onChange={setSearch} />
         </div>
      </div>

      {/* ---------- PAGE LIST ---------- */}
      <div style={{ minHeight: "420px" }}>
        <table className="table  table-hover  align-middle"  >
          <thead>
            <tr>
              <th>Title</th>
              <th>Edit</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {pages.length ? (
              pages.map((p) => (
                <tr key={p._id}  className="tableRowHeight">
                  <td>{p.title}</td>
                  <td>
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
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        className="toggle-input"
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
                      <span className="toggle-slider"></span>
                    </label>
                  </td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async () => {
                        if (!window.confirm("Delete this page?")) return;
                        await deletePageApi(p._id);
                        fetchPages();
                        toast.success("Page deleted");
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
