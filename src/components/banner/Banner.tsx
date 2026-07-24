// components/banner/Banner.tsx — with bulk actions
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bulkDeleteBannersApi,
  bulkToggleBannersApi,
  deletebannerApi,
  getAllbannersApi,
  togglebannerApi,
} from "../../services/allAPi";
import "../common/common_toggle.css";
import "../common/common_styels.css";
import { toast } from "react-toastify";
import type { BannerResponse } from "../../types/bannerTypes";
import BannerTable from "./Banner_table";
import { useAuth } from "../../context/useAuth";

export default function Banner() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [banners, setBanners] = useState<BannerResponse[]>([]);

  const fetchBanners = async () => {
    try {
      const res = await getAllbannersApi();
      setBanners(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="container p-md-2">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">Banner</h4>
        {can("banner", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/banner/add")}
          >
            + Add banner
          </button>
        )}
      </div>

      <BannerTable
        data={banners}
        onEdit={(banner) => navigate(`/admin-dash/banner/edit/${banner._id}`)}
        canEdit={can("banner", "update")}
        canToggle={can("banner", "status")}
        canDelete={can("banner", "delete")}
        onToggle={async (id) => {
          try {
            await togglebannerApi(id);
            fetchBanners();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this banner? Both images will also be removed.")) return;

          try {
            await deletebannerApi(id);
            fetchBanners();
            toast.success("Banner deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
        // ✅ BULK DELETE
        onBulkDelete={async (ids) => {
          if (
            !window.confirm(
              `Delete ${ids.length} banner(s)? All images will also be removed. This cannot be undone.`
            )
          )
            return;

          try {
            const res = await bulkDeleteBannersApi(ids);
            toast.success(res.data.message);
            fetchBanners();
          } catch {
            toast.error("Bulk delete failed");
          }
        }}
        // ✅ BULK STATUS
        onBulkToggle={async (ids, isActive) => {
          const verb = isActive ? "Activate" : "Deactivate";
          if (!window.confirm(`${verb} ${ids.length} banner(s)?`)) return;

          try {
            const res = await bulkToggleBannersApi(ids, isActive);
            toast.success(res.data.message);
            fetchBanners();
          } catch {
            toast.error("Bulk status update failed");
          }
        }}
      />
    </div>
  );
}