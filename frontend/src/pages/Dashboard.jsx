import { useEffect, useState } from "react";
import DonationForm from "../components/DonationForm";
import RegularDistributionForm from "../components/RegularDistributionForm";
import EmergencyDistributionForm from "../components/EmergencyDistributionForm";
import Alert from "../components/Alert";
import ReplacementModal from "../components/ReplacementModal";

const bloodDistribution = {
  "A+": 34, "A-": 4,
  "B+": 17, "B-": 2,
  "AB+": 7, "AB-": 1,
  "O+": 32, "O-": 3,
};

const bloodCompatibility = {
  "A+": ["A+", "A-", "O+", "O-"],
  "O+": ["O+", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "AB+": ["AB+", "A+", "B+", "O+", "A-", "B-", "AB-", "O-"],
  "A-": ["A-", "O-"],
  "O-": ["O-"],
  "B-": ["B-", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"]
};

const getStatusColor = (percent) => {
  if (percent < 5) return "bg-red-500";
  if (percent < 15) return "bg-yellow-400";
  return "bg-green-500";
};

export default function Dashboard() {
  const [donations, setDonations] = useState([]);
  const [bloodData, setBloodData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDistributionForm, setShowDistributionForm] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [alert, setAlert] = useState(null);
  const [modalData, setModalData] = useState({ isOpen: false });
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = () => {
    fetch("http://127.0.0.1:8000/api/donations/")
      .then((res) => res.json())
      .then((data) => {
        setDonations(data);
        updateBloodStats(data);
      });
  };

  const updateBloodStats = (donationList) => {
    const grouped = {};
    donationList.forEach((don) => {
      grouped[don.blood_type] = (grouped[don.blood_type] || 0) + 1;
    });

    const updated = Object.entries(bloodDistribution).map(([type, percent]) => ({
      type,
      percent,
      amount: grouped[type] || 0,
    }));

    setBloodData(updated);
  };

  const performDistribution = async (usedType, quantity, originalType = null) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/distribute/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blood_type: usedType, quantity }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({
          type: "success",
          title: "הניפוק בוצע בהצלחה!",
          message: originalType
            ? `בוצע ניפוק של ${quantity} מנות מסוג ${usedType} במקום ${originalType}`
            : data.message,
        });
        fetchDonations();
      } else {
        setAlert({
          type: "error",
          title: "שגיאה בניפוק",
          message: data.message,
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        title: "שגיאת רשת",
        message: "לא ניתן להתחבר לשרת",
      });
    }
    setTimeout(() => setAlert(null), 5000);
  };

  const handleDistribute = async ({ blood_type, quantity }) => {
    const available = bloodData.reduce((acc, item) => {
      acc[item.type] = item.amount;
      return acc;
    }, {});

    if (available[blood_type] >= quantity) {
      return performDistribution(blood_type, quantity);
    }

    const alternatives = bloodCompatibility[blood_type].filter(
      (type) => type !== blood_type && available[type] >= quantity
    );

    if (alternatives.length === 0) {
      setAlert({
        type: "error",
        title: "אין מלאי מספיק",
        message: `ניסיון ניפוק ${quantity} מנות ${blood_type}, אך לא נמצאו סוגים תואמים זמינים בכמות המבוקשת.`,
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setModalData({
      isOpen: true,
      originalType: blood_type,
      replacementType: null,
      options: alternatives,
      quantity,
    });
  };

  const confirmReplacement = (replacementType) => {
    performDistribution(replacementType, modalData.quantity, modalData.originalType);
    setModalData({ isOpen: false });
  };

  const cancelReplacement = () => {
    setAlert({
      type: "info",
      title: "הניפוק בוטל",
      message: "המשתמש בחר לא להשתמש בסוג דם חלופי.",
    });
    setModalData({ isOpen: false });
    setTimeout(() => setAlert(null), 5000);
  };


  const handleExportAuditLog = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/export/audit-trail/", {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch audit trail");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit_trail_log.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading PDF:", error);
    setAlert({
      type: "error",
      title: "שגיאה ביצוא הלוג",
      message: "לא הצלחנו לייצא את הלוג. נסה שוב מאוחר יותר.",
    });
    setTimeout(() => setAlert(null), 5000);
  }
};

const handleExportAuditXML = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/export/audit-trail/xml/", {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch audit trail XML");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit_trail_log.xml");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading XML:", error);
    setAlert({
      type: "error",
      title: "שגיאה ביצוא XML",
      message: "לא הצלחנו לייצא את הלוג. נסה שוב מאוחר יותר.",
    });
    setTimeout(() => setAlert(null), 5000);
  }
};

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-white min-h-screen" dir="rtl">
      <div className="text-center mb-6">
  <img
    src="/blood.png"
    alt="Blood Logo"
    className="mx-auto w-32 h-32 object-contain drop-shadow-md animate-pulse"
  />
  <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight shadow-sm mt-2">
    מערכת ניהול בנק הדם הלאומי
  </h1>

  <div className="flex justify-center mt-6 gap-4 flex-wrap">
    <button
      className={`px-4 py-2 rounded-lg shadow-md font-semibold tracking-tight flex items-center gap-2 transition-colors duration-200 ${
        showForm ? "bg-blue-700" : "bg-blue-600"
      } text-white hover:bg-opacity-90`}
      onClick={() => {
        setShowForm(true);
        setShowDistributionForm(false);
        setShowEmergencyForm(false);
        setAlert(null);
      }}
    >
      🧸 קליטת תרומות
    </button>

    <button
      className={`px-4 py-2 rounded-lg shadow-md font-semibold tracking-tight flex items-center gap-2 transition-colors duration-200 ${
        showDistributionForm ? "bg-blue-700" : "bg-blue-500"
      } text-white hover:bg-opacity-90`}
      onClick={() => {
        setShowDistributionForm(true);
        setShowForm(false);
        setShowEmergencyForm(false);
        setAlert(null);
      }}
    >
      💙 ניפוק שגרתי
    </button>

    <button
      className={`px-4 py-2 rounded-lg shadow-md font-semibold tracking-tight flex items-center gap-2 transition-colors duration-200 ${
        showEmergencyForm ? "bg-red-700" : "bg-red-600"
      } text-white hover:bg-opacity-90`}
      onClick={() => {
        setShowEmergencyForm(true);
        setShowForm(false);
        setShowDistributionForm(false);
        setAlert(null);
      }}
    >
      🚨 ניפוק חירום
    </button>

    <button
  className="px-4 py-2 rounded-lg shadow-md font-semibold tracking-tight flex items-center gap-2 transition-colors duration-200 bg-gray-700 text-white hover:bg-gray-800"
  onClick={handleExportAuditLog}
>
  📝 ייצוא לוג פעילות PDF 
</button>

<button
  className="px-4 py-2 rounded-lg shadow-md font-semibold tracking-tight flex items-center gap-2 transition-colors duration-200 bg-yellow-600 text-white hover:bg-yellow-700"
  onClick={handleExportAuditXML}
>
  📄 ייצוא לוג XML
</button>
  </div>
  </div>

      {alert && <Alert type={alert.type} title={alert.title} message={alert.message} />}

      {showForm && <DonationForm onClose={() => setShowForm(false)} onRefresh={fetchDonations} setAlert={setAlert} />}
      {showDistributionForm && <RegularDistributionForm onDistribute={handleDistribute} />}
      {showEmergencyForm && <EmergencyDistributionForm onDistribute={handleDistribute} />}
      <ReplacementModal
              isOpen={modalData.isOpen}
              onConfirm={confirmReplacement}
              onCancel={cancelReplacement}
              originalType={modalData.originalType}
              replacementType={modalData.replacementType}
              options={modalData.options || []}
            />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {bloodData.map((item) => (
          <div
            key={item.type}
            className={`p-4 rounded-2xl shadow-md transition-all duration-300 cursor-pointer border 
              ${item.percent < 5 ? "bg-red-50 border-red-300 hover:ring-red-400" : "bg-white border-gray-200"}
              hover:shadow-xl hover:scale-105 hover:ring-2 hover:ring-opacity-50 animate-fade-in`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">{item.type}</span>
              <span className={`text-white px-2 py-1 text-xs rounded ${getStatusColor(item.percent)}`}>
                {item.amount === 0
                  ? "קריטי"
                  : item.percent < 5
                  ? "קריטי"
                  : item.percent < 15
                  ? "נמוך"
                  : "טוב"}
              </span>
            </div>
            <div className="text-sm text-gray-700 font-medium mb-2">כמות: {item.amount}</div>
            <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
              <div
                className={`h-full ${getStatusColor(item.percent)}`}
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{item.percent}% מהאוכלוסייה</div>
          </div>
        ))}
      </div>
      <div>
  <br />
  <img
    src="/img1.png"
    alt="Blood img"
    className="mx-auto w-40 h-45 object-contain drop-shadow-md "
  />
</div>
    </div>
  );
}
