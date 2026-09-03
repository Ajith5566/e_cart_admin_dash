/* eslint-disable react-hooks/set-state-in-effect */
// components/caseStudy/Industries.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteIndustriesApi,
  bulkToggleIndustriesApi,
  deleteIndustryApi,
  getAllIndustriesApi,
  toggleIndustryApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { IndustryResponse } from "../../types/industryTypes";
import IndustryTable from "./IndustryTable";


export default function Industries() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [industries, setIndustries] = useState<IndustryResponse[]>([]);

  const fetchIndustries = async () => {
    try {
      const res = await getAllIndustriesApi();
      setIndustries(res.data.data);
    } catch {
      toast.error("Failed to load industries");
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Industries</h4>
        {can("industry", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/industry/add")}
          >
            + Add Industry
          </button>
        )}
      </div>

      <IndustryTable
        data={industries}
        onEdit={(industry) => navigate(`/admin-dash/industry/edit/${industry._id}`)}
        canEdit={can("industry", "update")}
        canToggle={can("industry", "status")}
        canDelete={can("industry", "delete")}
        onToggle={async (id) => {
          try {
            await toggleIndustryApi(id);
            fetchIndustries();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this industry? The image will also be removed.")) return;
          try {
            await deleteIndustryApi(id);
            fetchIndustries();
            toast.success("Industry deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(
            `Delete ${ids.length} industry(ies)? Their images will also be removed.`
          )) return;
          try {
            const res = await bulkDeleteIndustriesApi(ids);
            toast.success(res.data.message);
            fetchIndustries();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} industry(ies)?`)) return;
          try {
            const res = await bulkToggleIndustriesApi(ids, isActive);
            toast.success(res.data.message);
            fetchIndustries();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}