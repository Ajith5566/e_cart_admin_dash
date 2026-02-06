
type Props = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
}: Props) {

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    const delta = 2; // pages around current

    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">

      {/* PREV */}
      <button
        className="btn btn-outline-secondary"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        ◀
      </button>

      {/* PAGE BUTTONS */}
      {getVisiblePages().map((p, index) =>
        p === "..." ? (
          <span key={index} className="px-2">...</span>
        ) : (
          <button
            key={p}
            className={`btn ${
              p === currentPage ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => onChange(Number(p))}
          >
            {p}
          </button>
        )
      )}

      {/* NEXT */}
      <button
        className="btn btn-outline-secondary"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        ▶
      </button>

    </div>
  );
}
