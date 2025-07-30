import { useState } from "react";

export default function DonationForm({ onClose, onRefresh, setAlert }) {
  const [formData, setFormData] = useState({
    blood_type: "",
    donor_name: "",
    donor_id: "",
    donation_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // הגבלת ת"ז ל-9 ספרות בלבד
    if (name === "donor_id") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 9);
      setFormData((prev) => ({ ...prev, donor_id: digitsOnly }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/donations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({
          type: "success",
          title: "התרומה נקלטה בהצלחה",
          message: `נרשמה תרומת דם מסוג ${formData.blood_type} על שם ${formData.donor_name}`,
        });

        if (onRefresh) onRefresh();
        onClose();
      } else {
        setAlert({
          type: "error",
          title: "שגיאה בהוספה",
          message: data.message || "קרתה שגיאה בעת ניסיון שמירת התרומה.",
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        title: "שגיאת רשת",
        message: "לא הצלחנו להתחבר לשרת. נסה שוב מאוחר יותר.",
      });
    }

    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl mx-auto mt-10 border border-gray-200">
      <h2 className="text-xl font-bold text-blue-800 text-right mb-2">🩸 קליטת תרומות דם</h2>
      <p className="text-gray-600 text-sm mb-6 text-right">
        רישום תרומות דם חדשות לבנק הדם הלאומי
      </p>
      <form onSubmit={handleSubmit} dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">סוג דם</label>
            <select
              name="blood_type"
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
            <label className="text-sm font-medium">תאריך התרומה</label>
            <input
              type="date"
              name="donation_date"
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]} // ❌ תאריך עתידי
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">שם מלא של התורם</label>
            <input
              type="text"
              name="donor_name"
              onChange={handleChange}
              placeholder="שם ושם משפחה"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">מספר תעודת זהות</label>
            <input
              type="text"
              name="donor_id"
              value={formData.donor_id}
              onChange={handleChange}
              placeholder="123456789"
              maxLength={9}
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold shadow-sm transition"
          >
            📝 רישום התרומה
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold shadow-sm transition"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
