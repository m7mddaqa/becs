import { useEffect, useState } from "react";

export default function EmergencyDistributionForm({ onDistribute }) {
  const [oMinusUnits, setOMinusUnits] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("http://127.0.0.1:8000/api/donations/", { headers: { 'Authorization': `Token ${token}` }})
      .then((res) => res.json())
      .then((data) => {
        const count = data.filter((item) => item.blood_type === "O-").length;
        setOMinusUnits(count);
      });
  }, []);

  const handleEmergencyDistribute = () => {
    if (oMinusUnits === 0) return;
    onDistribute({ blood_type: "O-", quantity: oMinusUnits });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto mt-8 border border-red-300" dir="rtl">
      {/* כותרת */}
      <h2 className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2">
        🚨 מצב חירום - אר"ן
      </h2>
      <p className="text-gray-700 text-sm mb-5">
        ניפוק מנות דם מסוג <strong>O-</strong> במצב חירום רב נפגעים
      </p>

      {/* קופסת הסבר אדומה */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <h3 className="font-semibold text-red-700 mb-2">❗ מצב חירום - אר"ן</h3>
        <p className="text-sm text-red-800 mb-2">
          מצב חירום זה מחייב ניפוק דם מסוג <strong>O-</strong> - הוא הסוג האוניברסלי שמתאים לכל סוגי הדם.
          במצב חירום כאשר אין זמן לבדיקות, ניפוק O- מציל חיים. חשוב לנהל את המלאי בתשומת לב.
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg text-blue-900 font-bold">
            {oMinusUnits} מנות זמינות
          </span>
          <button
            className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold shadow-sm transition ${
              oMinusUnits === 0 && "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleEmergencyDistribute}
            disabled={oMinusUnits === 0}
          >
            ניפוק כל מנות O- למצב חירום
          </button>
        </div>
      </div>

      {/* הסבר חשוב */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-md font-bold text-gray-800 mb-2">🧠 מידע חשוב על ניפוק חירום</h4>
        <ul className="list-disc text-sm text-gray-700 pl-5 space-y-1">
          <li>
            <strong>למה רק O-?</strong> במצב חירום, כאשר חיי אדם בסכנה ואין זמן לבדיקות, דם מסוג O- הוא הבחירה הבטוחה היחידה המתאימה לכל המטופלים.
          </li>
          <li>
            <strong>השפעה על הניפוק השגרתי:</strong> השימוש ב-O- במצב חירום משפיע על המלאי לניפוק שגרתי, ולכן חשוב לנהל את המלאי בזהירות ולעודד תרומות O-.
          </li>
          <li>
            <strong>אסטרטגיה:</strong> בניפוק שגרתי יש להעדיף שימוש בסוגי דם פחות נדירים כתחליפים כדי לשמור על מלאי O- למצבי חירום.
          </li>
        </ul>
      </div>
    </div>
  );
}
