// components/pages/PageEditor.tsx — with bulk actions
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  bulkDeletePagesApi,
  bulkTogglePagesApi,
  deletePageApi,
  getAllPagesApi,
  togglePageApi,
} from "../../services/allAPi";
import { useNavigate } from "react-router-dom";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import type { PageType } from "../../types/types";
import PageTable from "./PageTable";
import { useAuth } from "../../context/useAuth";

export default function PageEditor() {
  const navigate = useNavigate();
  const { can } = useAuth();

  const [pages, setPages] = useState<PageType[]>([]);

  const fetchPages = async () => {
    try {
      const res = await getAllPagesApi();
      setPages(res.data);
    } catch {
      toast.error("Failed to fetch pages");
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Page</h4>
        {can("pages", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/pages/add")}
          >
            + Add Page
          </button>
        )}
      </div>

      <div style={{ minHeight: "420px" }}>
        <PageTable
          data={pages}
          canEdit={can("pages", "update")}
          canToggle={can("pages", "status")}
          canDelete={can("pages", "delete")}
          onEdit={(page) => navigate(`/admin-dash/pages/edit/${page._id}`)}
          onToggle={async (id) => {
            try {
              await togglePageApi(id);
              fetchPages();
            } catch {
              toast.error("Status update failed");
            }
          }}
          onDelete={async (id) => {
            if (!window.confirm("Delete this page?")) return;

            try {
              await deletePageApi(id);
              fetchPages();
              toast.success("Page deleted");
            } catch {
              toast.error("Delete failed");
            }
          }}
          // ✅ BULK DELETE — selected (or all, when All is checked)
          onBulkDelete={async (ids) => {
            if (
              !window.confirm(
                `Delete ${ids.length} page(s)? Their SEO meta and slug redirects will also be removed. This cannot be undone.`
              )
            )
              return;

            try {
              const res = await bulkDeletePagesApi(ids);
              toast.success(res.data.message);
              fetchPages();
            } catch {
              toast.error("Bulk delete failed");
            }
          }}
          // ✅ BULK STATUS — deactivate/activate selected (or all)
          onBulkToggle={async (ids, isActive) => {
            const verb = isActive ? "Activate" : "Deactivate";
            if (!window.confirm(`${verb} ${ids.length} page(s)?`)) return;

            try {
              const res = await bulkTogglePagesApi(ids, isActive);
              toast.success(res.data.message);
              fetchPages();
            } catch {
              toast.error("Bulk status update failed");
            }
          }}
        />
      </div>
    </div>
  );
}