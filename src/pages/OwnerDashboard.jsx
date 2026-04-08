import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function OwnerDashboard() {
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(true);
  const [userName, setUserName] = useState("");
const [greeting, setGreeting] = useState("");

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("purity_user"));
  if (user && user.name) {
    setUserName(user.name);
  }
}, []);

  // Auto Greeting based on Time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(isHindi ? "सुप्रभात" : "Good Morning");
    else if (hour < 17) setGreeting(isHindi ? "नमस्ते" : "Good Afternoon");
    else setGreeting(isHindi ? "शुभ संध्या" : "Good Evening");
  }, [isHindi]);

  const t = (en, hi) => (isHindi ? hi : en);

  // Menu items with Real Images and Icons
  const menuItems = [
    { id: 1, en: "Milk Entry", hi: "दूध की एंट्री", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200", icon: "🥛", color: "#e3f2fd", desc: "Daily collection" },
    { id: 2, en: "View Orders", hi: "ऑर्डर देखें", img: "https://thumbs.dreamstime.com/z/purchase-order-online-form-deal-concept-85090475.jpg", icon: "📦", color: "#fff3e0", desc: "Customer requests" },
    { id: 3, en: "Make Bill and Send", hi: "बिल बनाएं और भेजें", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=200", icon: "📄", color: "#f1f8e9", desc: "WhatsApp invoices" },
    { id: 4, en: "Records", hi: "रिकॉर्ड", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=200", icon: "📚", color: "#f3e5f5", desc: "History & Data" },
    { id: 5, en: "Animal Feed", hi: "जानवर का खाना", img: "https://cdn.pixabay.com/photo/2022/12/09/20/49/buffalo-7645996_1280.jpg", icon: "🌾", color: "#efebe9", desc: "Feed & Ration" },
    { id: 6, en: "Expenses", hi: "खर्चे लिखें", img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=200", icon: "💸", color: "#ffebee", desc: "Daily spending" },
    { id: 7, en: "Customers", hi: "ग्राहक ", img: "https://c8.alamy.com/comp/2JEKY1D/young-smiling-male-customer-choosing-milk-and-dairy-products-in-supermarket-2JEKY1D.jpg", icon: "👥", color: "#e0f2f1", desc: "Manage people" },
    { id: 8, en: "Milk Stock", hi: "दूध का स्टॉक", img: "https://images.unsplash.com/photo-1528498033973-3c070444eb31?auto=format&fit=crop&q=80&w=200", icon: "🧊", color: "#e8eaf6", desc: "Available Milk" },
    { id: 9, en: "Health/Doctor", hi: "डॉक्टर/इलाज", img: "https://images.unsplash.com/photo-1584036561566-baf241f1467d?auto=format&fit=crop&q=80&w=200", icon: "🩺", color: "#fce4ec", desc: "Animal health" },
    { id: 10, en: "Settings", hi: "सेटिंग्स", img: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=200", icon: "⚙️", color: "#eceff1", desc: "Profile setup" },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* 1. TOP HEADER */}
      <header className="main-header">
        <div className="brand-box">
          <span className="logo-icon">🥛</span>
          <div>
            <h1 className="brand-name">PURITY PRODUCT 5D</h1>
            <p className="tagline">{t("Owner Dashboard", "मालिक डैशबोर्ड")}</p>
          </div>
        </div>
        <button className="lang-toggle" onClick={() => setIsHindi(!isHindi)}>
          {isHindi ? "English" : "हिन्दी"}
        </button>
      </header>

      {/* 2. WELCOME GREETING CARD */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>{greeting}, {userName} Ji ! 👋</h2>
          <p>{t("Have a productive day today.", "आपका दिन शुभ और मंगलमय हो।")}</p>
        </div>
        <div className="welcome-img">
            <img src="https://cdn-icons-png.flaticon.com/512/2304/2304226.png" alt="user" />
        </div>
      </div>

      {/* 3. QUICK STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">{t("Today's Total", "आज का कुल दूध")}</span>
          <span className="stat-value">L</span>
        </div>
        <div className="stat-card blue-card">
          <span className="stat-label">{t("Total Revenue", "कुल कमाई")}</span>
          <span className="stat-value">₹</span>
        </div>
      </div>

      {/* 4. PHOTO GRID MENU */}
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div
  key={item.id}
  className="menu-item-card"
  onClick={() => {
    if (item.id === 1) {
    navigate("/milk-entry");
  }
  if (item.id === 3) {
    navigate("/monthly-bill");
  }
   if (item.id === 4) {
    navigate("/customer-reports");
  }
   if (item.id === 8) {
    navigate("/milk-report");
  }
    if (item.id === 7) {
      navigate("/add-customer");
    }
  }}
>
            <div className="image-container">
              <img src={item.img} alt={item.en} />
              <div className="floating-icon">{item.icon}</div>
            </div>
            <div className="card-info">
              <h3>{t(item.en, item.hi)}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="dashboard-footer">
        <p>© 2026 Purity Product 5D | {t("Software Version", "सॉफ्टवेयर वर्जन")} 2.0</p>
      </footer>

      <style>{`
        .dashboard-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding: 15px;
          padding-top: 85px;
          font-family: 'Poppins', sans-serif;
        }

        /* Header Styles */
        .main-header {
          position: fixed;
          top: 0; left: 0; right: 0; height: 70px;
          background: #0f172a;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 15px;
          z-index: 1000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .brand-box { display: flex; align-items: center; gap: 10px; }
        .logo-icon { font-size: 24px; background: #fff; padding: 5px; border-radius: 10px; }
        .brand-name { font-size: 14px; margin: 0; font-weight: 800; letter-spacing: 1px; }
        .tagline { font-size: 9px; margin: 0; color: #94a3b8; }

        .lang-toggle {
          background: #2563eb;
          color: white; border: none; padding: 6px 12px; border-radius: 12px;
          font-weight: 600; font-size: 12px; cursor: pointer;
        }

        /* Welcome Card */
        .welcome-banner {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-radius: 20px;
          padding: 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .welcome-content h2 { margin: 0; font-size: 20px; font-weight: 700; }
        .welcome-content p { margin: 5px 0 0; font-size: 13px; opacity: 0.8; }
        .welcome-img img { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #fff; }

        /* Stats Row */
        .stats-row { display: flex; gap: 12px; margin-bottom: 25px; }
        .stat-card {
          flex: 1; background: white; padding: 15px; border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .blue-card { background: #dbeafe; }
        .stat-label { font-size: 11px; color: #64748b; font-weight: 600; display: block; }
        .stat-value { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 5px; display: block; }

        /* Photo Grid Menu */
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 15px;
        }

        .menu-item-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          transition: transform 0.3s;
          border: 1px solid #f1f5f9;
        }

        .menu-item-card:active { transform: scale(0.96); }

        .image-container {
          height: 110px;
          position: relative;
          width: 100%;
        }

        .image-container img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .floating-icon {
          position: absolute;
          bottom: -15px; right: 10px;
          background: white; width: 40px; height: 40px;
          border-radius: 12px; display: flex; align-items: center;
          justify-content: center; font-size: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .card-info { padding: 20px 12px 15px; text-align: left; }
        .card-info h3 { font-size: 14px; margin: 0; color: #1e293b; font-weight: 700; }
        .card-info p { font-size: 10px; color: #64748b; margin-top: 4px; }

        .dashboard-footer {
          margin-top: 40px; text-align: center; color: #94a3b8; font-size: 10px;
          padding-bottom: 20px;
        }

        /* Mobile Optimization */
        @media (max-width: 480px) {
          .menu-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .welcome-content h2 { font-size: 18px; }
          .image-container { height: 90px; }
        }
      `}</style>
    </div>
  );
}

export default OwnerDashboard;