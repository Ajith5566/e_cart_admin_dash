/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletetestimonialApi, getAlltestimonialsApi, toggletestimonialApi } from "../../services/allAPi";
import '../common/common_toggle.css'
import '../common/common_styels.css'
import { toast } from "react-toastify";
import TestimonialTable from "./Testimonial_table";
import type { TestimonialResponse } from "../../types/testimonialTypes";
import { useAuth } from "../../context/useAuth"; // ← adjust path to match your structure

export default function Testimonials() {

  const navigate = useNavigate();
  const { can } = useAuth();

  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);

  const fetchTestimonials = async () => {
    try {
      const res = await getAlltestimonialsApi();
      setTestimonials(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load testimonials");
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <div className="container p-md-2 ">
      <div className="p-md-3 d-flex justify-content-between gap-5">
        <h4 className="fw-bold text-dark">
          Testimonials
        </h4>
        {can("testimonials", "create") && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin-dash/testimonials/add")}
          >
            + Add Testimonial
          </button>
        )}
      </div>

      <TestimonialTable
        data={testimonials}
        canEdit={can("testimonials", "update")}
        canToggle={can("testimonials", "status")}
        canDelete={can("testimonials", "delete")}
        onEdit={(testimonial) => navigate(`/admin-dash/testimonials/edit/${testimonial._id}`)}
        onToggle={async (id) => {
          try {
            await toggletestimonialApi(id);
            fetchTestimonials();
          } catch {
            toast.error("Status update failed");
          }
        }}
        onDelete={async (id) => {
          if (!window.confirm("Delete this testimonial?")) return;
          try {
            await deletetestimonialApi(id);
            fetchTestimonials();
            toast.success("testimonial deleted");
          } catch {
            toast.error("Delete failed");
          }
        }}
      />

      <div className="d-flex justify-content-center align-items-center mb-2 gap-2 flex-wrap" />
    </div>
  );
}