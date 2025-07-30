import React from "react";

export default function Alert({ title, message, type = "info" }) {
  const bgColor =
    type === "success"
      ? "bg-white border-green-300 text-green-800"
      : type === "error"
      ? "bg-white border-red-300 text-red-800"
      : "bg-white border-gray-300 text-gray-800";

  return (
    <div className={`border rounded-lg p-4 shadow-sm mt-4 ${bgColor}`} dir="rtl">
      <div className="font-bold mb-1">{title}</div>
      <div className="text-sm">{message}</div>
    </div>
  );
}