/* eslint-disable react-hooks/set-state-in-effect */
// components/caseStudy/Technologies.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteTechnologiesApi,
  bulkToggleTechnologiesApi,
  deleteTechnologyApi,
  getAllTechnologiesApi,
  toggleTechnologyApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { TechnologyResponse } from "../../types/technologyTypes";
import TechnologyTable from "./TechnologyTable";


export default function Technologies() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [technologies, setTechnologies] = useState<TechnologyResponse[]>([]);

  const fetchTechnologies = async () => {
    try {
      const res = await getAllTechnologiesApi();
      setTechnologies(res.data.data);
    } catch {
      toast.error("Failed to load technologies");
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Technologies</h4>
        {can("technology", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/technology/add")}
          >
            + Add Technology
          </button>
        )}
      </div>

      <TechnologyTable
        data={technologies}
        onEdit={(tech) => navigate(`/admin-dash/technology/edit/${tech._id}`)}
        canEdit={can("technology", "update")}
        canToggle={can("technology", "status")}
        canDelete={can("technology", "delete")}
         onDataReorder={(reordered) => setTechnologies(reordered)}
        onToggle={async (id) => {
          try {
            await toggleTechnologyApi(id);
            fetchTechnologies();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this technology? The logo will also be removed.")) return;
          try {
            await deleteTechnologyApi(id);
            fetchTechnologies();
            toast.success("Technology deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(
            `Delete ${ids.length} technology(ies)? Their logos will also be removed.`
          )) return;
          try {
            const res = await bulkDeleteTechnologiesApi(ids);
            toast.success(res.data.message);
            fetchTechnologies();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} technology(ies)?`)) return;
          try {
            const res = await bulkToggleTechnologiesApi(ids, isActive);
            toast.success(res.data.message);
            fetchTechnologies();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}