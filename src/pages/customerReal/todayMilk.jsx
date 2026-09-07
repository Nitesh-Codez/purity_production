import { useEffect, useState } from "react";
import axios from "axios";

const translations = {
  hi: {
    namaste: "🙏 नमस्ते",
    todayMilk: "आज का दूध",
    deliveredTitle: "दूध चढ़ गया है! ✨",
    deliveredSub: "Fresh & Pure • Delivered Today",
    deliveryDate: "Delivery Date",
    status: "Status",
    statusDelivered: "Delivered",
    holidayTitle: "नागा (Holiday)",
    holidaySub: "आज छुट्टी है / Today is a Holiday",
    holidayHint: "No milk delivery scheduled for today",
    pendingTitle: "अभी चढ़ाया नहीं गया है",
    pendingSub: "Not delivered yet / Waiting for update",
    pendingHint: "आज की दूध एंट्री अभी अपडेट नहीं हुई है • Entry pending",
    loading: "Loading...",
    holidayText: "नागा / Holiday",
    kg: "kg",
  },
  en: {
    namaste: "🙏 Welcome",
    todayMilk: "Today's Milk",
    deliveredTitle: "Milk Delivered! ✨",
    deliveredSub: "Fresh & Pure • Delivered Today",
    deliveryDate: "Delivery Date",
    status: "Status",
    statusDelivered: "Delivered",
    holidayTitle: "Holiday (Naga)",
    holidaySub: "Today is a Holiday",
    holidayHint: "No milk delivery scheduled for today",
    pendingTitle: "Not Delivered Yet",
    pendingSub: "Waiting for update",
    pendingHint: "Today's milk entry is not updated yet • Entry pending",
    loading: "Loading...",
    holidayText: "Holiday / Naga",
    kg: "kg",
  },
};

const TodayMilk = () => {
  const [milk, setMilk] = useState(null);
  const [userData, setUserData] = useState(null);
  const [translatedName, setTranslatedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateFill, setAnimateFill] = useState(false);
  const [lang, setLang] = useState("hi");

  const t = translations[lang];
  const maxCapacity = 3.0;

  const formatMilkQty = (qty) => {
    const num = parseFloat(qty);
    if (isNaN(num) || num === 0) return t.holidayText;
    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);
    let result = kg > 0 ? `${kg} ${t.kg} ` : "";
    if (grams === 750) result += "500g 250g";
    else if (grams > 0) result += `${grams}g`;
    return result.trim();
  };

  useEffect(() => {
    const fetchTodayMilk = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("Session expired. Please login again.");
          return;
        }
        const parsedUser = JSON.parse(userStr);
        setUserData(parsedUser);

        const res = await axios.get(
          `https://purity-production-backend.onrender.com/api/today/${parsedUser.id}`
        );
        if (res.data.success && res.data.data.length > 0) {
          setMilk(res.data.data[0]);
        }

        if (parsedUser.name) {
          try {
            const transRes = await axios.post(
              `https://purity-production-backend.onrender.com/api/translate-list`,
              { texts: [parsedUser.name] }
            );
            setTranslatedName(transRes.data[parsedUser.name] || parsedUser.name);
          } catch {
            setTranslatedName(parsedUser.name);
          }
        }
      } catch {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
        setTimeout(() => setAnimateFill(true), 100);
      }
    };
    fetchTodayMilk();
  }, []);

  const fillPercentage =
    animateFill && milk
      ? Math.min((parseFloat(milk.milk_quantity) / maxCapacity) * 100, 100)
      : 0;

  if (loading)
    return (
      <div className="main-container">
        <div className="glass-card animate-pop" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "15px", color: "#0284c7", fontWeight: "600" }}>{t.loading}</p>
        </div>
        <Styles />
      </div>
    );

  if (error)
    return (
      <div className="main-container">
        <div className="glass-card error-card animate-pop">
          <div className="error-icon">⚠️</div>
          <h2>{error}</h2>
        </div>
        <Styles />
      </div>
    );

  const isExplicitNaga =
    milk && (parseFloat(milk.milk_quantity) === 0 || milk.milk_quantity === "0" || milk.milk_quantity === "नागा / Holiday");

  return (
    <div className="main-container">
      <div className="glass-card animate-pop">
        <button className="lang-toggle" onClick={() => setLang(lang === "hi" ? "en" : "hi")}>
          {lang === "hi" ? "English" : "हिंदी"}
        </button>

        <div className="card-header">
          <div className="header-decoration"></div>
          <p className="namaste">{t.namaste}</p>
          <h1 className="user-display-name">{translatedName || userData?.name}</h1>
          <p className="date-line">
            {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {milk && !isExplicitNaga ? (
          <>
            <div className="bottle-section">
              <div className="bottle-glow"></div>
              <div className="milk-bottle">
                <div className="bottle-cap"><div className="cap-shine"></div></div>
                <div className="bottle-neck"></div>
                <div className="bottle-body">
                  <div className="milk-fill" style={{ height: `${fillPercentage}%` }}>
                    <div className="milk-wave"></div>
                    <div className="milk-wave wave-2"></div>
                    <div className="milk-bubbles"><span/><span/><span/></div>
                  </div>
                  <div className="measure-lines">
                    <div className="measure-line" style={{ bottom: "33%" }}><span>1kg</span></div>
                    <div className="measure-line" style={{ bottom: "66%" }}><span>2kg</span></div>
                  </div>
                </div>
              </div>
              <div className="qty-badge">
                <span className="qty-value">{formatMilkQty(milk.milk_quantity)}</span>
                <span className="qty-label">{t.todayMilk}</span>
              </div>
            </div>

            <div className="delivery-status">
              <div className="status-icon success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="status-text">
                <h3>{t.deliveredTitle}</h3>
                <p>{t.deliveredSub}</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <span className="info-label">{t.deliveryDate}</span>
                  <span className="info-value">
                    {new Date(milk.delivery_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">⏰</div>
                <div className="info-content">
                  <span className="info-label">{t.status}</span>
                  <span className="info-value delivered">{t.statusDelivered}</span>
                </div>
              </div>
            </div>
          </>
        ) : isExplicitNaga ? (
          <div className="naga-section animate-fade">
            <div className="empty-bottle-illustration">
              <div className="empty-bottle">
                <div className="bottle-cap"></div>
                <div className="bottle-neck"></div>
                <div className="bottle-body empty"><div className="empty-lines"><span/><span/><span/></div></div>
              </div>
            </div>
            <h2 className="naga-title">{t.holidayTitle}</h2>
            <p className="naga-subtitle">{t.holidaySub}</p>
            <p className="naga-hint">{t.holidayHint}</p>
          </div>
        ) : (
          <div className="pending-section animate-fade">
            <div className="pending-pulse-icon">⏳</div>
            <h2 className="pending-title">{t.pendingTitle}</h2>
            <p className="pending-subtitle">{t.pendingSub}</p>
            <p className="pending-hint">{t.pendingHint}</p>
          </div>
        )}
      </div>
      <Styles />
    </div>
  );
};

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .main-container { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 16px; font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%); background-size: 300% 300%; animation: bgAnimation 12s ease infinite; }
    @keyframes bgAnimation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .spinner { width: 45px; height: 45px; border: 4px solid rgba(2, 132, 199, 0.15); border-top: 4px solid #0284c7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .glass-card { position: relative; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 32px; padding: 30px 22px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset; }
    .lang-toggle { position: absolute; top: 16px; right: 18px; background: rgba(2, 132, 199, 0.1); border: 1px solid rgba(2, 132, 199, 0.2); color: #0284c7; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .lang-toggle:hover { background: #0284c7; color: #fff; }
    .animate-pop { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes popIn { 0% { opacity: 0; transform: scale(0.92) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-fade { animation: fadeIn 0.4s ease-in-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .card-header { text-align: center; margin-bottom: 25px; position: relative; }
    .header-decoration { width: 50px; height: 4px; background: linear-gradient(90deg, #0284c7, #38bdf8); border-radius: 2px; margin: 0 auto 15px; }
    .namaste { font-size: 15px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .user-display-name { font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #0f172a 30%, #0284c7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 6px; letter-spacing: -0.5px; }
    .date-line { font-size: 13px; color: #64748b; font-weight: 600; text-transform: capitalize; }
    .bottle-section { position: relative; display: flex; justify-content: center; align-items: flex-end; height: 210px; margin-bottom: 22px; }
    .bottle-glow { position: absolute; width: 140px; height: 140px; background: radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%); bottom: 20px; border-radius: 50%; animation: glowPulse 3s ease-in-out infinite; }
    @keyframes glowPulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } }
    .milk-bottle { position: relative; z-index: 2; }
    .bottle-cap { width: 34px; height: 16px; background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%); border-radius: 6px 6px 0 0; margin: 0 auto -2px; position: relative; box-shadow: 0 -2px 8px rgba(2, 132, 199, 0.3); }
    .cap-shine { position: absolute; top: 3px; left: 4px; width: 8px; height: 4px; background: rgba(255,255,255,0.6); border-radius: 10px; }
    .bottle-neck { width: 38px; height: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(241,245,249,0.8)); margin: 0 auto; border-left: 2px solid rgba(2, 132, 199, 0.4); border-right: 2px solid rgba(2, 132, 199, 0.4); }
    .bottle-body { width: 86px; height: 145px; background: rgba(255, 255, 255, 0.6); border: 3px solid rgba(2, 132, 199, 0.4); border-radius: 14px 14px 30px 30px; position: relative; overflow: hidden; box-shadow: inset 0 0 15px rgba(2, 132, 199, 0.08), 0 8px 20px rgba(0,0,0,0.06); }
    .milk-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%); transition: height 1.8s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.04); }
    .milk-wave { position: absolute; top: -7px; left: -50%; width: 200%; height: 18px; background: rgba(255, 255, 255, 0.95); border-radius: 40%; animation: waveMove 2.5s ease-in-out infinite; }
    .wave-2 { top: -4px; animation-delay: -1.25s; opacity: 0.6; }
    @keyframes waveMove { 0%, 100% { transform: translateX(-25%) rotate(0deg); } 50% { transform: translateX(0%) rotate(180deg); } }
    .milk-bubbles span { position: absolute; width: 6px; height: 6px; background: rgba(148, 163, 184, 0.5); border-radius: 50%; animation: bubbleRise 3s ease-in-out infinite; }
    .milk-bubbles span:nth-child(1) { left: 25%; animation-delay: 0s; }
    .milk-bubbles span:nth-child(2) { left: 55%; animation-delay: 1s; width: 5px; height: 5px; }
    .milk-bubbles span:nth-child(3) { left: 75%; animation-delay: 2s; width: 4px; height: 4px; }
    @keyframes bubbleRise { 0%, 100% { bottom: 10%; opacity: 0; } 50% { opacity: 1; } 90% { bottom: 75%; opacity: 0; } }
    .measure-lines { position: absolute; right: 4px; top: 0; bottom: 0; }
    .measure-line { position: absolute; right: 0; width: 12px; height: 2px; background: rgba(2, 132, 199, 0.3); }
    .measure-line span { position: absolute; right: 16px; top: -7px; font-size: 9px; color: #64748b; font-weight: 700; }
    .qty-badge { position: absolute; top: 5px; right: 10px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 10px 16px; border-radius: 16px; text-align: center; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3), 0 0 0 2px rgba(255,255,255,0.8) inset; animation: badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s both; }
    @keyframes badgePop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .qty-value { display: block; font-size: 16px; font-weight: 800; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.15); }
    .qty-label { display: block; font-size: 9px; color: #fef3c7; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1px; }
    .delivery-status { display: flex; align-items: center; gap: 14px; background: rgba(16, 185, 129, 0.08); padding: 16px 18px; border-radius: 18px; margin-bottom: 18px; border: 1px solid rgba(16, 185, 129, 0.2); }
    .status-icon { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .status-icon.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
    .status-icon svg { width: 20px; height: 20px; color: #fff; }
    .status-text h3 { font-size: 15px; font-weight: 700; color: #047857; margin-bottom: 2px; }
    .status-text p { font-size: 11px; color: #059669; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { background: rgba(255, 255, 255, 0.7); padding: 14px; border-radius: 14px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(2, 132, 199, 0.08); }
    .info-icon { font-size: 20px; }
    .info-label { display: block; font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { display: block; font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 1px; }
    .info-value.delivered { color: #059669; }
    .pending-section { text-align: center; padding: 25px 0 10px; }
    .pending-pulse-icon { font-size: 44px; margin-bottom: 15px; animation: pulseIcon 2s ease-in-out infinite; }
    @keyframes pulseIcon { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }
    .pending-title { font-size: 20px; font-weight: 800; color: #0284c7; margin-bottom: 6px; }
    .pending-subtitle { font-size: 13px; color: #334155; font-weight: 600; margin-bottom: 4px; }
    .pending-hint { font-size: 11px; color: #64748b; font-weight: 500; }
    .naga-section { text-align: center; padding: 20px 0 10px; }
    .empty-bottle-illustration { margin-bottom: 20px; }
    .empty-bottle { display: inline-block; }
    .empty-bottle .bottle-cap { background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%); box-shadow: none; }
    .empty-bottle .bottle-neck { border-color: rgba(148, 163, 184, 0.6); }
    .empty-bottle .bottle-body.empty { border-color: rgba(148, 163, 184, 0.6); background: rgba(255, 255, 255, 0.3); }
    .empty-lines span { display: block; height: 2px; background: rgba(148, 163, 184, 0.5); margin: 24px 14px; border-radius: 1px; }
    .naga-title { font-size: 22px; font-weight: 800; color: #ef4444; margin-bottom: 6px; }
    .naga-subtitle { font-size: 14px; color: #334155; font-weight: 600; margin-bottom: 4px; }
    .naga-hint { font-size: 11px; color: #64748b; font-weight: 500; }
    .error-card { text-align: center; padding: 40px 20px; }
    .error-icon { font-size: 42px; margin-bottom: 15px; }
    .error-card h2 { color: #ef4444; font-size: 15px; font-weight: 600; }
  `}</style>
);

export default TodayMilk;