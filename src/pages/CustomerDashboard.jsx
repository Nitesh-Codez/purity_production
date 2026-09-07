import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CustomerDashboard() {
  const [isHindi, setIsHindi] = useState(true);
  const [userData, setUserData] = useState(null);
  const [currentBill, setCurrentBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://purity-production-backend.onrender.com";

  const t = (en, hi) => (isHindi ? hi : en);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          navigate("/login");
          return;
        }
        const parsedUser = JSON.parse(userStr);
        setUserData(parsedUser);

        // Get user id correctly from the parsed user object from localStorage
        const userId = parsedUser.id || parsedUser._id;
        if (!userId) {
          console.error("User ID not found in localStorage object");
          setLoadingBill(false);
          return;
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Fetch dynamic current month bill using the correct endpoint and userId
        const res = await axios.get(
          `${API_BASE_URL}/api/bill/${userId}`,
          {
            params: { month: currentMonth, year: currentYear },
          }
        );
        
        if (res.data.success) {
          const billAmount = res.data.bill?.total_bill ?? res.data.totalBill ?? 0;
          setCurrentBill(billAmount);
        } else {
          setCurrentBill(0);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setCurrentBill(0);
      } finally {
        setLoadingBill(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  const menuItems = [
    { id: 1, en: "Today's Milk", hi: "आज का दूध", icon: "🥛", color: "#e3f2fd", desc: t("Check daily morning/evening entry", "दैनिक दूध एंट्री देखें") },
    { id: 2, en: "Monthly Record", hi: "महीने का रिकॉर्ड", icon: "📅", color: "#f1f8e9", desc: t("Check daily entry history", "पूरे महीने का हिसाब देखें") },
    { id: 3, en: "Order Dahi", hi: "दही आर्डर करें", icon: "🥣", color: "#fff3e0", desc: t("Fresh & Thick curd delivery", "ताजा और गाढ़ा दही मंगाएं") },
    { id: 4, en: "Order Ghee", hi: "शुद्ध घी लें", icon: "🍯", color: "#fff9c4", desc: t("100% Desi Cow Ghee", "100% शुद्ध देशी गाय का घी") },
    { id: 5, en: "Extra Milk", hi: "एक्स्ट्रा दूध चाहिए", icon: "➕", color: "#e1f5fe", desc: t("Request extra quantity for 1-2 days", "1 या 2 दिन के लिए अतिरिक्त दूध") },
    { id: 6, en: "Stop Milk", hi: "दूध बंद करें", icon: "🚫", color: "#ffebee", desc: t("Pause delivery temporarily", "छुट्टी के दिन दूध बंद करें") },
    { id: 7, en: "Pending Bill", hi: "बकाया बिल", icon: "💸", color: "#f3e5f5", desc: t("Pay via UPI / PhonePe / GPay", "ऑनलाइन भुगतान करें") },
    { id: 8, en: "Old Bills", hi: "पुराने बिल", icon: "📜", color: "#efebe9", desc: t("Download previous month bills", "पिछले बिल डाउनलोड करें") },
    { id: 9, en: "Quality Report", hi: "शुद्धता रिपोर्ट", icon: "✅", color: "#e0f2f1", desc: t("Check Fat & SNF percentage", "फैट और एसएनएफ जांच विवरण") },
    { id: 10, en: "Contact Owner", hi: "मालिक से बात करें", icon: "📞", color: "#e8eaf6", desc: t("Direct call or WhatsApp support", "कॉल या व्हाट्सएप पर संपर्क करें") },
  ];

  const handleCardClick = (id) => {
    if (id === 1) navigate("/today-milk");
    else if (id === 2) navigate("/milk-list");
    else if (id === 3) navigate("/customer-order");
    else if (id === 7) navigate("/pending-bill");
    else if (id === 10) window.open("https://wa.me/91XXXXXXXXXX", "_blank");
  };

  return (
    <div className="cust-wrapper">
      {/* Dark Modern Header */}
      <header className="cust-header">
        <div className="header-left">
          <div className="user-avatar">👤</div>
          <div>
            <h1 className="welcome-text">
              {userData?.name ? `Hello, ${userData.name}` : t("Hello, Customer", "नमस्ते, ग्राहक जी")}
            </h1>
            <p className="sub-header">PURITY PRODUCTION</p>
          </div>
        </div>
        <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
          {isHindi ? "English" : "हिन्दी"}
        </button>
      </header>

      {/* Hero Stats Card with Dynamic Bill */}
      <div className="hero-bill-card">
        <div className="bill-info">
          <span className="bill-label">{t("Current Month Bill", "इस महीने का कुल बिल")}</span>
          <h2 className="bill-amount">
            {loadingBill ? (
              <span className="bill-spinner"></span>
            ) : currentBill !== null ? (
              `₹${Number(currentBill).toFixed(2)}`
            ) : (
              "₹0.00"
            )}
          </h2>
        </div>
        <button className="pay-now-btn" onClick={() => navigate("/pending-bill")}>
          {t("Pay Now", "अभी जमा करें")}
        </button>
      </div>

      {/* Main Grid Options */}
      <div className="cust-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="cust-card"
            onClick={() => handleCardClick(item.id)}
          >
            <div className="cust-card-inner" style={{ backgroundColor: item.color }}>
              <div className="cust-icon-circle">{item.icon}</div>
              <div className="cust-card-content">
                <h3>{t(item.en, item.hi)}</h3>
                <p>{item.desc}</p>
              </div>
              <div className="go-arrow">❯</div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Support Button */}
      <div className="support-float" onClick={() => window.open("https://wa.me/91XXXXXXXXXX", "_blank")}>
        <span>💬</span>
      </div>

      <style jsx>{`
        .cust-wrapper {
          min-height: 100vh;
          background: #f7f9fc;
          padding: 15px;
          padding-top: 90px;
          padding-bottom: 40px;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }

        .cust-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #002d5b;
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .header-left { display: flex; align-items: center; gap: 12px; }
        .user-avatar { 
          width: 42px; height: 42px; background: rgba(255,255,255,0.15); 
          border-radius: 50%; display: flex; align-items: center; 
          justify-content: center; font-size: 20px; border: 1px solid rgba(255,255,255,0.2);
        }

        .welcome-text { font-size: 16px; margin: 0; font-weight: 700; }
        .sub-header { font-size: 10px; margin: 0; color: #8bb9ff; letter-spacing: 1.2px; font-weight: 600; }

        .lang-btn {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lang-btn:hover { background: rgba(255, 255, 255, 0.25); }

        .hero-bill-card {
          background: linear-gradient(135deg, #0056b3 0%, #00a8ff 100%);
          padding: 22px 24px;
          border-radius: 24px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          box-shadow: 0 10px 25px rgba(0, 86, 179, 0.25);
          position: relative;
          overflow: hidden;
        }
        .hero-bill-card::after {
          content: '';
          position: absolute;
          right: -20px;
          bottom: -20px;
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }

        .bill-label { font-size: 12px; opacity: 0.9; font-weight: 500; }
        .bill-amount { font-size: 30px; margin: 4px 0 0; font-weight: 800; letter-spacing: -0.5px; }
        .bill-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pay-now-btn {
          background: white;
          color: #0056b3;
          border: none;
          padding: 12px 20px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .pay-now-btn:active { transform: scale(0.95); }

        .cust-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cust-card {
          width: 100%;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cust-card:active { transform: scale(0.98); }

        .cust-card-inner {
          display: flex;
          align-items: center;
          padding: 16px 18px;
          border-radius: 20px;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .cust-icon-circle {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-right: 15px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .cust-card-content { flex-grow: 1; padding-right: 20px; }
        .cust-card-content h3 {
          font-size: 15px;
          margin: 0;
          color: #0f172a;
          font-weight: 700;
        }

        .cust-card-content p {
          font-size: 11px;
          margin: 3px 0 0;
          color: #64748b;
          font-weight: 500;
        }

        .go-arrow {
          position: absolute;
          right: 18px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: bold;
        }

        .support-float {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 55px;
          height: 55px;
          background: #25d366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
          color: white;
          z-index: 100;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .support-float:hover { transform: scale(1.08); }

        @media (max-width: 480px) {
          .cust-wrapper { padding: 12px; padding-top: 85px; }
          .hero-bill-card { padding: 18px 20px; }
          .bill-amount { font-size: 26px; }
          .cust-card-inner { padding: 14px 16px; }
        }
      `}</style>
    </div>
  );
}

export default CustomerDashboard;