import { useEffect, useState } from "react";
import axios from "axios";

const TodayMilk = () => {
  const [milk, setMilk] = useState(null);
  const [userData, setUserData] = useState(null);
  const [translatedName, setTranslatedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateFill, setAnimateFill] = useState(false);

  const maxCapacity = 3.0;

  const formatMilkQty = (qty) => {
    const num = parseFloat(qty);
    if (isNaN(num) || num === 0) return "नागा / Holiday";

    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);

    let result = "";
    if (kg > 0) result += `${kg} kg `;

    if (grams === 750) {
      result += "500g 250g";
    } else if (grams > 0) {
      result += `${grams}g`;
    }

    return result.trim();
  };

  useEffect(() => {
    const fetchTodayMilk = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem("user");

        if (!userStr) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userStr);
        setUserData(parsedUser);

       // Sirf plain URL string use karein
const res = await axios.get(
  `https://purity-production-backend.onrender.com/api/today/${parsedUser.id}`
);

        if (res.data.success && res.data.data.length > 0) {
          setMilk(res.data.data[0]);
        }

        if (parsedUser.name) {
          try {
            // ✅ Ek dum sahi (Plain String format)
const transRes = await axios.post(
  `https://purity-production-backend.onrender.com/api/translate-list`,
  { texts: [parsedUser.name] }
);
            setTranslatedName(transRes.data[parsedUser.name] || parsedUser.name);
          } catch (e) {
            setTranslatedName(parsedUser.name);
          }
        }
      } catch (err) {
        setError("Server error. Please try again.");
      } finally {
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setAnimateFill(true), 100);
        }, 1800);
      }
    };

    fetchTodayMilk();
  }, []);

  const fillPercentage =
    animateFill && milk
      ? Math.min((parseFloat(milk.milk_quantity) / maxCapacity) * 100, 100)
      : 0;

  if (loading) {
    return (
      <div className="main-container">
        <div className="loader-card">
          <div className="loader-bottle">
            <div className="loader-liquid"></div>
          </div>
          <h2 className="loading-msg">
            दूध आ रहा है...
            <span>Please Wait</span>
          </h2>
        </div>
        <Styles />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="glass-card error-card">
          <div className="error-icon">⚠️</div>
          <h2>{error}</h2>
        </div>
        <Styles />
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="glass-card animate-pop">
        {/* TOP HEADER */}
        <div className="card-header">
          <div className="header-decoration"></div>
          <p className="namaste">🙏 नमस्ते</p>
          <h1 className="user-display-name">
            {translatedName || userData?.name}
          </h1>
          <p className="date-line">
            {new Date().toLocaleDateString("hi-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {milk ? (
          <>
            {/* BOTTLE SECTION */}
            <div className="bottle-section">
              <div className="bottle-glow"></div>
              <div className="milk-bottle">
                <div className="bottle-cap">
                  <div className="cap-shine"></div>
                </div>
                <div className="bottle-neck"></div>
                <div className="bottle-body">
                  <div
                    className="milk-fill"
                    style={{ height: `${fillPercentage}%` }}
                  >
                    <div className="milk-wave"></div>
                    <div className="milk-wave wave-2"></div>
                    <div className="milk-bubbles">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  {/* Measurement Lines */}
                  <div className="measure-lines">
                    <div className="measure-line" style={{ bottom: "33%" }}>
                      <span>1kg</span>
                    </div>
                    <div className="measure-line" style={{ bottom: "66%" }}>
                      <span>2kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Badge */}
              <div className="qty-badge">
                <span className="qty-value">{formatMilkQty(milk.milk_quantity)}</span>
                <span className="qty-label">आज का दूध</span>
              </div>
            </div>

            {/* SUCCESS BANNER */}
            <div className="delivery-status">
              <div className="status-icon success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="status-text">
                <h3>दूध चढ़ गया है! ✨</h3>
                <p>Fresh & Pure • Delivered Today</p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <span className="info-label">Delivery Date</span>
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
                  <span className="info-label">Status</span>
                  <span className="info-value delivered">Delivered</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="naga-section">
            <div className="empty-bottle-illustration">
              <div className="empty-bottle">
                <div className="bottle-cap"></div>
                <div className="bottle-neck"></div>
                <div className="bottle-body empty">
                  <div className="empty-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="naga-title">नागा (Holiday)</h2>
            <p className="naga-subtitle">आज की कोई एंट्री नहीं मिली</p>
            <p className="naga-hint">No delivery recorded for today</p>
          </div>
        )}
      </div>
      <Styles />
    </div>
  );
};

const Styles = () => (
  <style>{`
    @import url('[fonts.googleapis.com](https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap)');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .main-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* ========== LOADER ========== */
    .loader-card {
      text-align: center;
      padding: 40px;
    }

    .loader-bottle {
      width: 60px;
      height: 100px;
      border: 4px solid rgba(255,255,255,0.9);
      border-radius: 10px 10px 25px 25px;
      margin: 0 auto 30px;
      position: relative;
      overflow: hidden;
      background: rgba(255,255,255,0.1);
    }

    .loader-bottle::before {
      content: '';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 12px;
      background: rgba(255,255,255,0.9);
      border-radius: 5px;
    }

    .loader-liquid {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 0%;
      background: linear-gradient(180deg, #fff 0%, #f0f0f0 100%);
      animation: fillUp 2s ease-in-out infinite;
    }

    @keyframes fillUp {
      0%, 100% { height: 10%; }
      50% { height: 80%; }
    }

    .loading-msg {
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .loading-msg span {
      display: block;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      margin-top: 5px;
    }

    /* ========== MAIN CARD ========== */
    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 40px;
      padding: 35px 25px;
      width: 100%;
      max-width: 380px;
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    }

    .animate-pop {
      animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.8) translateY(30px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ========== HEADER ========== */
    .card-header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
    }

    .header-decoration {
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
      margin: 0 auto 20px;
    }

    .namaste {
      font-size: 16px;
      color: #888;
      font-weight: 500;
      margin-bottom: 5px;
    }

    .user-display-name {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 5px;
    }

    .date-line {
      font-size: 13px;
      color: #999;
      font-weight: 500;
    }

    /* ========== BOTTLE ========== */
    .bottle-section {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      height: 220px;
      margin-bottom: 25px;
    }

    .bottle-glow {
      position: absolute;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
      bottom: 20px;
      border-radius: 50%;
      animation: glowPulse 3s ease-in-out infinite;
    }

    @keyframes glowPulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .milk-bottle {
      position: relative;
      z-index: 2;
    }

    .bottle-cap {
      width: 36px;
      height: 18px;
      background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
      border-radius: 8px 8px 0 0;
      margin: 0 auto -2px;
      position: relative;
      box-shadow: 0 -3px 10px rgba(102, 126, 234, 0.3);
    }

    .cap-shine {
      position: absolute;
      top: 3px;
      left: 5px;
      width: 10px;
      height: 5px;
      background: rgba(255,255,255,0.4);
      border-radius: 10px;
    }

    .bottle-neck {
      width: 40px;
      height: 15px;
      background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(240,240,240,0.9));
      margin: 0 auto;
      border-left: 3px solid #667eea;
      border-right: 3px solid #667eea;
    }

    .bottle-body {
      width: 90px;
      height: 150px;
      background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(245,245,245,0.8));
      border: 4px solid #667eea;
      border-radius: 15px 15px 35px 35px;
      position: relative;
      overflow: hidden;
      box-shadow: 
        inset 0 0 30px rgba(102, 126, 234, 0.1),
        0 10px 30px rgba(0,0,0,0.1);
    }

    .milk-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 50%, #f0f4ff 100%);
      transition: height 2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        inset 0 10px 20px rgba(102, 126, 234, 0.05),
        inset 0 -5px 15px rgba(0,0,0,0.02);
    }

    .milk-wave {
      position: absolute;
      top: -8px;
      left: -50%;
      width: 200%;
      height: 20px;
      background: rgba(255,255,255,0.9);
      border-radius: 40%;
      animation: waveMove 2.5s ease-in-out infinite;
    }

    .wave-2 {
      top: -5px;
      animation-delay: -1.25s;
      opacity: 0.5;
    }

    @keyframes waveMove {
      0%, 100% { transform: translateX(-25%) rotate(0deg); }
      50% { transform: translateX(0%) rotate(180deg); }
    }

    .milk-bubbles span {
      position: absolute;
      width: 8px;
      height: 8px;
      background: rgba(255,255,255,0.8);
      border-radius: 50%;
      animation: bubbleRise 3s ease-in-out infinite;
    }

    .milk-bubbles span:nth-child(1) { left: 20%; animation-delay: 0s; }
    .milk-bubbles span:nth-child(2) { left: 50%; animation-delay: 1s; width: 6px; height: 6px; }
    .milk-bubbles span:nth-child(3) { left: 75%; animation-delay: 2s; width: 5px; height: 5px; }

    @keyframes bubbleRise {
      0%, 100% { bottom: 10%; opacity: 0; }
      50% { opacity: 1; }
      90% { bottom: 80%; opacity: 0; }
    }

    .measure-lines {
      position: absolute;
      right: 5px;
      top: 0;
      bottom: 0;
    }

    .measure-line {
      position: absolute;
      right: 0;
      width: 15px;
      height: 2px;
      background: rgba(102, 126, 234, 0.3);
    }

    .measure-line span {
      position: absolute;
      right: 20px;
      top: -8px;
      font-size: 9px;
      color: #999;
      font-weight: 600;
    }

    .qty-badge {
      position: absolute;
      top: 10px;
      right: 20px;
      background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
      padding: 12px 18px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 
        0 8px 25px rgba(255, 183, 0, 0.4),
        0 0 0 3px rgba(255,255,255,0.5) inset;
      animation: badgePop 0.5s ease 2s both;
    }

    @keyframes badgePop {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .qty-value {
      display: block;
      font-size: 18px;
      font-weight: 800;
      color: #333;
    }

    .qty-label {
      display: block;
      font-size: 10px;
      color: #666;
      font-weight: 600;
      margin-top: 2px;
    }

    /* ========== DELIVERY STATUS ========== */
    .delivery-status {
      display: flex;
      align-items: center;
      gap: 15px;
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      padding: 18px 20px;
      border-radius: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(40, 167, 69, 0.2);
    }

    .status-icon {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .status-icon.success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 5px 20px rgba(40, 167, 69, 0.4);
      animation: successPulse 2s ease-in-out infinite;
    }

    @keyframes successPulse {
      0%, 100% { box-shadow: 0 5px 20px rgba(40, 167, 69, 0.4); }
      50% { box-shadow: 0 5px 30px rgba(40, 167, 69, 0.6), 0 0 0 10px rgba(40, 167, 69, 0.1); }
    }

    .status-icon svg {
      width: 22px;
      height: 22px;
      color: #fff;
    }

    .status-text h3 {
      font-size: 16px;
      font-weight: 700;
      color: #155724;
      margin-bottom: 2px;
    }

    .status-text p {
      font-size: 12px;
      color: #28a745;
      font-weight: 500;
    }

    /* ========== INFO GRID ========== */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .info-item {
      background: #f8f9ff;
      padding: 15px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }

    .info-icon {
      font-size: 22px;
    }

    .info-label {
      display: block;
      font-size: 10px;
      color: #888;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #333;
    }

    .info-value.delivered {
      color: #28a745;
    }

    /* ========== NAGA / HOLIDAY ========== */
    .naga-section {
      text-align: center;
      padding: 30px 0;
    }

    .empty-bottle-illustration {
      margin-bottom: 25px;
    }

    .empty-bottle {
      display: inline-block;
    }

    .empty-bottle .bottle-cap {
      background: linear-gradient(180deg, #ccc 0%, #bbb 100%);
      box-shadow: none;
    }

    .empty-bottle .bottle-neck {
      border-color: #ccc;
    }

    .empty-bottle .bottle-body.empty {
      border-color: #ccc;
      background: linear-gradient(180deg, rgba(200,200,200,0.1), rgba(200,200,200,0.2));
    }

    .empty-lines span {
      display: block;
      height: 2px;
      background: #ddd;
      margin: 25px 15px;
      border-radius: 1px;
    }

    .naga-title {
      font-size: 24px;
      font-weight: 800;
      color: #666;
      margin-bottom: 8px;
    }

    .naga-subtitle {
      font-size: 14px;
      color: #888;
      margin-bottom: 5px;
    }

    .naga-hint {
      font-size: 12px;
      color: #aaa;
    }

    /* ========== ERROR ========== */
    .error-card {
      text-align: center;
      padding: 50px 30px;
    }

    .error-icon {
      font-size: 50px;
      margin-bottom: 20px;
    }

    .error-card h2 {
      color: #dc3545;
      font-size: 16px;
      font-weight: 600;
    }
  `}</style>
);

export default TodayMilk;
