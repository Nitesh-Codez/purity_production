import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const [isHindi, setIsHindi] = useState(true);
  const navigate = useNavigate();

  // Language Toggle Function
  const t = (en, hi) => (isHindi ? hi : en);

  const menuItems = [
    { id: 1, en: "Today's Milk", hi: "आज का दूध", icon: "🥛", color: "#e3f2fd", desc: "1.5 Litre (Morning)" },
    { id: 2, en: "Monthly Record", hi: "महीने का रिकॉर्ड", icon: "📅", color: "#f1f8e9", desc: "Check daily entry" },
    { id: 3, en: "Order Dahi", hi: "दही आर्डर करें", icon: "🥣", color: "#fff3e0", desc: "Fresh & Thick curd" },
    { id: 4, en: "Order Ghee", hi: "शुद्ध घी लें", icon: "🍯", color: "#fff9c4", desc: "100% Desi Cow Ghee" },
    { id: 5, en: "Extra Milk", hi: "एक्स्ट्रा दूध चाहिए", icon: "➕", color: "#e1f5fe", desc: "For 1 or 2 days" },
    { id: 6, en: "Stop Milk", hi: "दूध बंद करें", icon: "🚫", color: "#ffebee", desc: "Pause delivery" },
    { id: 7, en: "Pending Bill", hi: "बकाया बिल", icon: "💸", color: "#f3e5f5", desc: "Pay via PhonePe/GPay" },
    { id: 8, en: "Old Bills", hi: "पुराने बिल", icon: "📜", color: "#efebe9", desc: "Download PDF" },
    { id: 9, en: "Quality Report", hi: "शुद्धता रिपोर्ट", icon: "✅", color: "#e0f2f1", desc: "Fat & SNF Details" },
    { id: 10, en: "Contact Owner", hi: "मालिक से बात करें", icon: "📞", color: "#e8eaf6", desc: "Call or WhatsApp" },
  ];

  return (
    <div className="cust-wrapper">
      {/* Dark Modern Header */}
      <header className="cust-header">
        <div className="header-left">
          <div className="user-avatar">👤</div>
          <div>
            <h1 className="welcome-text">{t("Hello, Customer", "नमस्ते, ग्राहक जी")}</h1>
            <p className="sub-header">PURITY PRODUCT 5D</p>
          </div>
        </div>
        <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
          {isHindi ? "English" : "हिन्दी"}
        </button>
      </header>

      {/* Hero Stats Card */}
      <div className="hero-bill-card">
        <div className="bill-info">
          <span className="bill-label">{t("Current Month Bill", "इस महीने का बिल")}</span>
          <h2 className="bill-amount">₹2,450</h2>
        </div>
        <button className="pay-now-btn">{t("Pay Now", "अभी जमा करें")}</button>
      </div>

      {/* Main Grid Options */}
      <div className="cust-grid">
        {menuItems.map((item) => (
          <div
  key={item.id}
  className="cust-card"
  onClick={() => {

    if (item.id === 1) {
      navigate("/today-milk");
    }

    if (item.id === 2) {
      navigate("/milk-list");
    }
    if(item.id === 3){
      navigate("/customer-order");
    }

  }}
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
      <div className="support-float">
        <span>💬</span>
      </div>

      <style jsx>{`
        .cust-wrapper {
          min-height: 100vh;
          background: #f7f9fc;
          padding: 15px;
          padding-top: 90px;
          padding-bottom: 40px;
          font-family: 'Inter', sans-serif;
        }

        /* Header Style */
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
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .header-left { display: flex; align-items: center; gap: 12px; }
        .user-avatar { 
          width: 40px; height: 40px; background: white; 
          border-radius: 50%; display: flex; align-items: center; 
          justify-content: center; font-size: 20px;
        }

        .welcome-text { font-size: 16px; margin: 0; font-weight: 700; }
        .sub-header { font-size: 10px; margin: 0; color: #8bb9ff; letter-spacing: 1px; }

        .lang-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid white;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 12px;
          cursor: pointer;
        }

        /* Hero Card */
        .hero-bill-card {
          background: linear-gradient(135deg, #0056b3, #00a8ff);
          padding: 25px;
          border-radius: 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          box-shadow: 0 8px 20px rgba(0,86,179,0.25);
        }

        .bill-label { font-size: 12px; opacity: 0.9; }
        .bill-amount { font-size: 28px; margin: 5px 0 0; font-weight: 800; }

        .pay-now-btn {
          background: white;
          color: #0056b3;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }

        /* Grid System */
        .cust-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cust-card {
          width: 100%;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cust-card:active { transform: scale(0.98); }

        .cust-card-inner {
          display: flex;
          align-items: center;
          padding: 18px;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .cust-icon-circle {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-right: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .cust-card-content h3 {
          font-size: 16px;
          margin: 0;
          color: #1a1a1a;
          font-weight: 700;
        }

        .cust-card-content p {
          font-size: 12px;
          margin: 4px 0 0;
          color: #666;
        }

        .go-arrow {
          position: absolute;
          right: 20px;
          color: #999;
          font-size: 14px;
        }

        /* Floating Button */
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
          font-size: 24px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          color: white;
          z-index: 100;
        }

        /* Responsive Mobile Layout */
        @media (max-width: 480px) {
          .cust-card-content h3 { font-size: 15px; }
          .hero-bill-card { padding: 20px; }
          .bill-amount { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}

export default CustomerDashboard;