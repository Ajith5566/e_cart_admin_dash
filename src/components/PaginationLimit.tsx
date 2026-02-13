type Props = {
  limit: number;
  onChange: (value: number) => void;
};

export default function PaginationLimit({ limit, onChange }: Props) {

  return (
    <div className="d-flex align-items-center gap-2">

      <select
        className="form-select"
        style={{ width: "100px" }}
        value={limit}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>

      <span>entries per page</span>

    </div>
  );
}
