import { useState } from "react";

export default function RegularDistributionForm({ onDistribute, onRefresh }) {
  const [formData, setFormData] = useState({
    blood_type: "",
    quantity: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.blood_type || !formData.quantity) {
      alert("נא למלא את כל השדות");
      return;
    }

    // פעולה חיצונית שמבצעת את הניפוק בפועל
    onDistribute(formData);

    // ריענון הטבלה (אם קיים)
    if (onRefresh) {
      onRefresh();
    }

    // איפוס שדות הטופס
    setFormData({
      blood_type: "",
      quantity: "",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl mx-auto mt-10 border border-gray-200">
      <h2 className="text-xl font-bold text-blue-800 text-right mb-2">💙 ניפוק דם שגרתי</h2>
      <p className="text-gray-600 text-sm mb-6 text-right">
        ניפוק מנות דם לחדרי ניתוח וטראומה
      </p>

      <form
        onSubmit={handleSubmit}
        dir="rtl"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="text-sm font-medium">סוג דם מבוקש</label>
          <select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="">בחר סוג</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">כמות מנות</label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="מספר מנות"
            required
          />
        </div>

        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold shadow-sm transition w-full"
          >
            ביצוע ניפוק 💙
          </button>
        </div>
      </form>
    </div>
  );
}
