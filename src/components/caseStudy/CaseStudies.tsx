/* eslint-disable react-hooks/set-state-in-effect */
// components/caseStudy/CaseStudies.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteCaseStudiesApi,
  bulkToggleCaseStudiesApi,
  deleteCaseStudyApi,
  getAllCaseStudiesApi,
  toggleCaseStudyApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { CaseStudyResponse } from "../../types/caseStudyTypes";
import CaseStudyTable from "./CaseStudyTable";

export default function CaseStudies() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [caseStudies, setCaseStudies] = useState<Partial<CaseStudyResponse>[]>([]);

  const fetchCaseStudies = async () => {
    try {
      const res = await getAllCaseStudiesApi();
      setCaseStudies(res.data.data);
    } catch {
      toast.error("Failed to load case studies");
    }
  };

  useEffect(() => { fetchCaseStudies(); }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Case Studies</h4>
        {can("casestudy", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/case-study/add")}
          >
            + Add Case Study
          </button>
        )}
      </div>

      <CaseStudyTable
        data={caseStudies}
        onEdit={(cs) => navigate(`/admin-dash/case-study/edit/${cs._id}`)}
        canEdit={can("casestudy", "update")}
        canToggle={can("casestudy", "status")}
        canDelete={can("casestudy", "delete")}
        onDataReorder={(reordered) => setCaseStudies(reordered)}  
        onToggle={async (id) => {
          try { await toggleCaseStudyApi(id); fetchCaseStudies(); }
          catch { toast.error("Status update failed"); }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this case study? All images, meta and slug redirects will be removed.")) return;
          try { await deleteCaseStudyApi(id); fetchCaseStudies(); toast.success("Case study deleted"); }
          catch { toast.error("Delete failed"); }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(`Delete ${ids.length} case stud${ids.length === 1 ? "y" : "ies"}? All their images will also be removed.`)) return;
          try {
            const res = await bulkDeleteCaseStudiesApi(ids);
            toast.success(res.data.message);
            fetchCaseStudies();
          } catch { toast.error("Bulk delete failed"); }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} case stud${ids.length === 1 ? "y" : "ies"}?`)) return;
          try {
            const res = await bulkToggleCaseStudiesApi(ids, isActive);
            toast.success(res.data.message);
            fetchCaseStudies();
          } catch { toast.error("Bulk status update failed"); }
        }}
      />
    </div>
  );
}