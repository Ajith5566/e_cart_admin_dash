// components/faq/Add_faq.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { addFaqApi, getFaqByIdApi, updateFaqApi } from "../../services/allAPi";

type FormErrors = { question: string; answer: string };
const emptyErrors: FormErrors = { question: "", answer: "" };

export default function Add_faq() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);

  useEffect(() => {
    if (!id) { setLoadingData(false); return; }

    const fetchFaq = async () => {
      try {
        const res = await getFaqByIdApi(id);
        const f = res.data.data ?? (res.data as any);
        setQuestion(f.question ?? "");
        setAnswer(f.answer ?? "");
        setStatus(f.isActive);
      } catch {
        toast.error("Failed to load FAQ");
        navigate("/admin-dash/faq");
      } finally {
        setLoadingData(false);
      }
    };

    fetchFaq();
  }, [id]);

  const scrollToFirstError = (newErrors: FormErrors) => {
    const firstKey = Object.keys(newErrors).find((k) => newErrors[k as keyof FormErrors] !== "");
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => (el as HTMLElement).focus?.(), 300);
    }
  };

  const validateForm = () => {
    const next = { ...emptyErrors };
    let ok = true;

    if (!question.trim()) { next.question = "Question is required"; ok = false; }
    if (!answer.trim()) { next.answer = "Answer is required"; ok = false; }

    setErrors(next);
    if (!ok) scrollToFirstError(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = { question: question.trim(), answer: answer.trim(), status };

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateFaqApi(id, payload);
        toast.success("FAQ updated");
      } else {
        await addFaqApi(payload);
        toast.success("FAQ added");
      }
      navigate("/admin-dash/faq");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-2">
        <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mb-0">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <h4 className="fw-bold">{isEditMode ? "Edit FAQ" : "Add FAQ"}</h4>
        <button className="btn btn-secondary mb-3" onClick={() => navigate("/admin-dash/faq")}>
          ← Back to FAQs
        </button>
      </div>

      <div className="p-md-2 mb-4">
        <label htmlFor="question" className="form-label">
          Question <span className="text-danger">*</span>
        </label>
        <input
          id="question"
          className={`form-control ${errors.question ? "is-invalid" : ""}`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How does your process work?"
        />
        {errors.question && <div className="invalid-feedback">{errors.question}</div>}

        <label htmlFor="answer" className="form-label mt-3">
          Answer <span className="text-danger">*</span>
        </label>
        <textarea
          id="answer"
          className={`form-control ${errors.answer ? "is-invalid" : ""}`}
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer"
        />
        {errors.answer && <div className="invalid-feedback d-block">{errors.answer}</div>}

        <div className="row mt-3">
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select className="form-control" value={status ? "true" : "false"} onChange={(e) => setStatus(e.target.value === "true")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update FAQ" : "Add FAQ"}
          </button>
          {isEditMode && (
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/admin-dash/faq")} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}