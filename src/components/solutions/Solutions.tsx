/* eslint-disable react-hooks/set-state-in-effect */
// components/caseStudy/Solutions.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteSolutionsApi,
  bulkToggleSolutionsApi,
  deleteSolutionApi,
  getAllSolutionsApi,
  toggleSolutionApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { SolutionResponse } from "../../types/solutionTypes";
import SolutionTable from "./SolutionTable";

export default function Solutions() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [solutions, setSolutions] = useState<SolutionResponse[]>([]);

  const fetchSolutions = async () => {
    try {
      const res = await getAllSolutionsApi();
      setSolutions(res.data.data);
    } catch {
      toast.error("Failed to load solutions");
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Solutions</h4>
        {can("solution", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/solution/add")}
          >
            + Add Solution
          </button>
        )}
      </div>

      <SolutionTable
        data={solutions}
        onEdit={(solution) => navigate(`/admin-dash/solution/edit/${solution._id}`)}
        onDataReorder={(reordered) => setSolutions(reordered)}
        canEdit={can("solution", "update")}
        canToggle={can("solution", "status")}
        canDelete={can("solution", "delete")}
        onToggle={async (id) => {
          try {
            await toggleSolutionApi(id);
            fetchSolutions();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this solution?")) return;
          try {
            await deleteSolutionApi(id);
            fetchSolutions();
            toast.success("Solution deleted");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} solution(s)?`)) return;
          try {
            const res = await bulkDeleteSolutionsApi(ids);
            toast.success(res.data.message);
            fetchSolutions();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} solution(s)?`)) return;
          try {
            const res = await bulkToggleSolutionsApi(ids, isActive);
            toast.success(res.data.message);
            fetchSolutions();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}