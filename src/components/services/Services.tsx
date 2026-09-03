/* eslint-disable react-hooks/set-state-in-effect */
// components/caseStudy/Services.tsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteServicesApi,
  bulkToggleServicesApi,
  deleteServiceApi,
  getAllServicesApi,
  toggleServiceApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";

import { useAuth } from "../../context/useAuth";
import type { ServiceResponse } from "../../types/serviceTypes";
import ServiceTable from "./ServiceTable";
import ServiceFaqModal from "./Servicefaqmodal";


export default function Services() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [faqModalFor, setFaqModalFor] = useState<ServiceResponse | null>(null);

  const fetchServices = async () => {
    try {
      const res = await getAllServicesApi();
      setServices(res.data.data);
    } catch {
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Services</h4>
        {can("service", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/service/add")}
          >
            + Add Service
          </button>
        )}
      </div>

      <ServiceTable
        data={services}
        onEdit={(service) => navigate(`/admin-dash/service/edit/${service._id}`)}
        canEdit={can("service", "update")}
        canToggle={can("service", "status")}
        canDelete={can("service", "delete")}
        canFaqs={can("service", "update")}
        onFaqs={(service) => setFaqModalFor(service)}
        onToggle={async (id) => {
          try {
            await toggleServiceApi(id);
            fetchServices();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this service? Its images will also be removed.")) return;
          try {
            await deleteServiceApi(id);
            fetchServices();
            toast.success("Service deleted");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }}
        onBulkDelete={async (ids) => {
          if (!window.confirm(
            `Delete ${ids.length} service(s)? Their images will also be removed.`
          )) return;
          try {
            const res = await bulkDeleteServicesApi(ids);
            toast.success(res.data.message);
            fetchServices();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} service(s)?`)) return;
          try {
            const res = await bulkToggleServicesApi(ids, isActive);
            toast.success(res.data.message);
            fetchServices();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />

      {faqModalFor && (
        <ServiceFaqModal
          serviceId={faqModalFor._id}
          serviceTitle={faqModalFor.title}
          initialFaqs={faqModalFor.faqs ?? []}
          onClose={() => setFaqModalFor(null)}
          onSaved={(faqs) =>
            setServices((prev) => prev.map((s) => (s._id === faqModalFor._id ? { ...s, faqs } : s)))
          }
        />
      )}
    </div>
  );
}