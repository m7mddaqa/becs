import React, { useState, useEffect } from "react";

export default function ReplacementModal({ isOpen, onConfirm, onCancel, originalType, options }) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (options && options.length > 0) {
      setSelected(options[0]); // ברירת מחדל
    }
  }, [options]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-right">
        <h2 className="text-xl font-bold text-red-700 mb-2">
          אין מספיק מנות מסוג {originalType}
        </h2>
        <p className="mb-2 text-gray-800">
          בחר תחליף מהרשימה:
        </p>
        <select
          className="w-full p-2 border rounded mb-4"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {options.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
          >
            ביטול
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={!selected}
          >
            אישור
          </button>
        </div>
      </div>
    </div>
  );
}
