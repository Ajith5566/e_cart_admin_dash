// components/caseStudy/ServiceFaqModal.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateServiceFaqsApi } from "../../services/allAPi";
import type { ServiceFaqItem } from "../../types/serviceTypes";

type Props = {
  serviceId: string;
  serviceTitle: string;
  initialFaqs: ServiceFaqItem[];
  onClose: () => void;
  onSaved: (faqs: ServiceFaqItem[]) => void;
};

export default function ServiceFaqModal({ serviceId, serviceTitle, initialFaqs, onClose, onSaved }: Props) {
  const [faqs, setFaqs] = useState<ServiceFaqItem[]>(initialFaqs.length ? initialFaqs : [{ question: "", answer: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaqs((prev) => prev.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: keyof ServiceFaqItem, val: string) =>
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));

  const handleSave = async () => {
    const incomplete = faqs.some((f) => {
      const hasQ = f.question.trim().length > 0;
      const hasA = f.answer.trim().length > 0;
      return hasQ !== hasA; // half-filled row
    });
    if (incomplete) {
      toast.error("Every FAQ needs both a question and an answer");
      return;
    }

    const cleaned = faqs.filter((f) => f.question.trim() && f.answer.trim());

    try {
      setSaving(true);
      await updateServiceFaqsApi(serviceId, cleaned);
      toast.success("FAQs updated");
      onSaved(cleaned);
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update FAQs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-lg p-4"
        style={{ width: "min(700px, 92vw)", maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">FAQs — {serviceTitle}</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        {faqs.map((f, i) => (
          <div key={i} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold small text-muted">FAQ {i + 1}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeFaq(i)}>Remove</button>
            </div>
            <input
              className="form-control mb-2"
              placeholder="Question"
              value={f.question}
              onChange={(e) => updateFaq(i, "question", e.target.value)}
            />
            <textarea
              className="form-control"
              rows={2}
              placeholder="Answer"
              value={f.answer}
              onChange={(e) => updateFaq(i, "answer", e.target.value)}
            />
          </div>
        ))}

        <button type="button" className="btn btn-outline-dark btn-sm mb-3" onClick={addFaq}>+ Add FAQ</button>

        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save FAQs"}
          </button>
        </div>
      </div>
    </div>
  );
}