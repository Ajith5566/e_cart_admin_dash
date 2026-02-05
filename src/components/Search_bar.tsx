import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ProductSearch({ value, onChange }: Props) {
  return (
    <input
      type="text"
      className="form-control"
      style={{ maxWidth: 250 }}
      placeholder="Search ..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
