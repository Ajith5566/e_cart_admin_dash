// components/common/Pagination.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";

type Props = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function Pagination({
  page, totalPages, hasNext, hasPrev, total, limit,
  onPageChange, onLimitChange,
}: Props) {
  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow   = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
      <div className="d-flex align-items-center gap-2">
        <select
          className="form-select form-select-sm"
          style={{ width: "80px" }}
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="text-muted" style={{ fontSize: "13px" }}>
          Showing {startRow}–{endRow} of {total}
        </span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(1)} disabled={!hasPrev}>
          <FontAwesomeIcon icon={faAnglesLeft} />
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrev}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
        <span className="btn btn-secondary btn-sm" style={{ minWidth: "36px", textAlign: "center" }}>
          {page}
        </span>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(page + 1)} disabled={!hasNext}>
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(totalPages)} disabled={!hasNext}>
          <FontAwesomeIcon icon={faAnglesRight} />
        </button>
      </div>
    </div>
  );
}