// components/faq/Faqs.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteFaqsApi,
  bulkToggleFaqsApi,
  deleteFaqApi,
  getAllFaqsApi,
  toggleFaqApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { FaqResponse } from "../../types/faqTypes";
import FaqTable from "./FaqTable";

export default function Faqs() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [faqs, setFaqs] = useState<FaqResponse[]>([]);

  const fetchFaqs = async () => {
    try {
      const res = await getAllFaqsApi();
      setFaqs(res.data.data);
    } catch {
      toast.error("Failed to load FAQs");
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">FAQs</h4>
        {can("faq", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/faq/add")}
          >
            + Add FAQ
          </button>
        )}
      </div>

      <FaqTable
        data={faqs}
        onEdit={(faq) => navigate(`/admin-dash/faq/edit/${faq._id}`)}
        onDataReorder={(reordered) => setFaqs(reordered)} 
        canEdit={can("faq", "update")}
        canToggle={can("faq", "status")}
        canDelete={can("faq", "delete")}
        onToggle={async (id) => {
          try {
            await toggleFaqApi(id);
            fetchFaqs();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this FAQ?")) return;
          try {
            await deleteFaqApi(id);
            fetchFaqs();
            toast.success("FAQ deleted");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} FAQ(s)?`)) return;
          try {
            const res = await bulkDeleteFaqsApi(ids);
            toast.success(res.data.message);
            fetchFaqs();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} FAQ(s)?`)) return;
          try {
            const res = await bulkToggleFaqsApi(ids, isActive);
            toast.success(res.data.message);
            fetchFaqs();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}