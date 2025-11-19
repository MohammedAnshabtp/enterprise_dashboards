"use client";
export default function Card({ title, children }) {
  return (
    <div className="bg-white border rounded p-4">
      <h3 className="font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
