import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function CustomerCardsPage() {
  const today = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHindi, setIsHindi] = useState(true);
  const [translatedNames, setTranslatedNames] = useState({});

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  const t = useCallback((en, hi) => (isHindi ? hi : en), [isHindi]);

  const formatMilk = (qty) => {
    const num = parseFloat(qty);
    if (!num || isNaN(num)) return "0 kg";
    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);
    let res = "";
    if (kg > 0) res += `${kg}kg `;
    if (grams > 0) res += `${grams}g`;
    return res.trim() || "0 kg";
  };

  const months = [
    { v: 1, n: "January / जनवरी" }, { v: 2, n: "February / फरवरी" },
    { v: 3, n: "March / मार्च" }, { v: 4, n: "April / अप्रैल" },
    { v: 5, n: "May / मई" }, { v: 6, n: "June / जून" },
    { v: 7, n: "July / जुलाई" }, { v: 8, n: "August / अगस्त" },
    { v: 9, n: "September / सितंबर" }, { v: 10, n: "October / अक्टूबर" },
    { v: 11, n: "November / नवंबर" }, { v: 12, n: "December / दिसंबर" }
  ];

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      // Hum cards wala data fetch kar rahe hain
      const res = await axios.get(`${API}/api/monthly-bill/cards`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      const data = res.data || [];
      setCards(data);

      if (data.length > 0) {
        const names = data.map(c => c.name);
        const transRes = await axios.post(`${API}/api/translate-list`, { texts: names });
        setTranslatedNames(transRes.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setCards([]); 
    } finally {
      setLoading(false);
    }
  }, [API, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Calculation Logic jo Billing Page se match karega
  const totalSummary = cards.reduce((acc, curr) => {
    const milkVal = parseFloat(curr.total_milk) || 0;
    // Prioritize bill_total (जो DB में सेव है), fallback to total_money
    const billVal = parseFloat(curr.bill_total) || parseFloat(curr.total_money) || 0;
    acc.milk += milkVal;
    acc.bill += billVal;
    return acc;
  }, { milk: 0, bill: 0 });

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div className="header-top">
          <div className="brand">
            <div className="logo-box">🥛</div>
            <h1 className="title-main">{t("Purity Cards", "प्योरिटी कार्ड्स")}</h1>
          </div>
          <button className="lang-toggle-btn" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>

        <div className="filter-grid">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="modern-select">
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="modern-select">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <main className="content-container">
        {loading ? (
          <div className="loader-overlay">
            <div className="spinner-modern"></div>
            <p>{t("Syncing Data...", "डाटा लोड हो रहा है...")}</p>
          </div>
        ) : (
          <div className="card-masonry">
            {cards.length > 0 ? cards.map((c, i) => {
              // YAHAN FIX HAI: Dono values check ho rahi hain taaki paise Billing Page se match karein
              const displayBill = parseFloat(c.bill_total) || parseFloat(c.total_money) || 0;
              
              return (
                <div key={i} className="glass-card">
                  <div className="card-banner">
                    <div className="user-profile">
                      <div className="name-icon">{c.name.charAt(0)}</div>
                      <h2 className="user-name">{isHindi ? (translatedNames[c.name] || c.name) : c.name}</h2>
                    </div>
                    <span className="month-pill">{selectedMonth}/{selectedYear}</span>
                  </div>

                  <div className="card-details">
                    <div className="main-stat">
                      <span className="stat-label-dark">{t("Total Milk Volume", "कुल दूध की मात्रा")}</span>
                      <span className="stat-value-milk">{formatMilk(c.total_milk)}</span>
                    </div>
                    
                    <div className="stats-row-modern">
                      <div className="mini-stat">
                        <span className="stat-label-dark">{t("Rate Applied", "लगाया गया रेट")}</span>
                        <span className="mini-val">₹{parseFloat(c.price_per_kg || 80)}</span>
                      </div>
                      <div className="mini-stat text-right">
                        <span className="stat-label-dark">{t("Naga/Gaps", "नागा (दिन)")}</span>
                        <span className="mini-val danger-text">{c.naga_days || 0}</span>
                      </div>
                    </div>

                    <div className="final-total-box">
                      <span className="final-label">{t("Payable Total", "कुल देय राशि")}</span>
                      <span className="final-amount-val">₹{Math.round(displayBill).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="empty-view">
                <span>📂</span>
                <p>{t("No data found for this period.", "इस महीने का कोई डाटा नहीं है।")}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {!loading && cards.length > 0 && (
        <footer className="footer-summary-bar">
          <div className="footer-col">
            <span className="foot-label">{t("Total Volume", "कुल दूध")}</span>
            <span className="foot-data">{formatMilk(totalSummary.milk)}</span>
          </div>
          <div className="footer-v-line"></div>
          <div className="footer-col">
            <span className="foot-label">{t("Expected Revenue", "कुल कलेक्शन")}</span>
            <span className="foot-data-money">₹{Math.round(totalSummary.bill).toLocaleString()}</span>
          </div>
        </footer>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        .page-wrapper { background: #f0f4f7; min-height: 100vh; font-family: 'Inter', sans-serif; padding-bottom: 120px; }
        .page-header { background: #1a237e; padding: 25px 20px; color: white; border-radius: 0 0 25px 25px; box-shadow: 0 10px 30px rgba(26, 35, 126, 0.2); position: sticky; top: 0; z-index: 1000; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .logo-box { background: white; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .title-main { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .lang-toggle-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modern-select { background: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; color: #1a237e; font-size: 14px; outline: none; appearance: none; }
        .content-container { padding: 20px; }
        .card-masonry { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .glass-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.3s ease; }
        .card-banner { padding: 15px 20px; background: #f8fafd; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f4f8; }
        .user-profile { display: flex; align-items: center; gap: 12px; }
        .name-icon { width: 36px; height: 36px; background: #3949ab; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
        .user-name { margin: 0; font-size: 17px; font-weight: 800; color: #1a237e; }
        .month-pill { background: #e8effd; color: #3949ab; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; }
        .card-details { padding: 20px; }
        .stat-label-dark { font-size: 11px; color: #7f8c8d; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .stat-value-milk { font-size: 24px; font-weight: 800; color: #27ae60; display: block; }
        .stats-row-modern { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 12px 0; border-top: 1px solid #f1f4f8; border-bottom: 1px solid #f1f4f8; }
        .mini-val { font-size: 16px; font-weight: 700; color: #2c3e50; }
        .danger-text { color: #e74c3c; }
        .text-right { text-align: right; }
        .final-total-box { background: #1a237e; padding: 15px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
        .final-label { color: #c5cae9; font-size: 13px; font-weight: 600; }
        .final-amount-val { color: white; font-size: 20px; font-weight: 800; }
        .footer-summary-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 18px; display: flex; justify-content: space-around; align-items: center; border-top: 4px solid #1a237e; z-index: 999; border-radius: 20px 20px 0 0; }
        .footer-col { text-align: center; }
        .foot-label { font-size: 11px; color: #7f8c8d; font-weight: 800; }
        .foot-data { font-size: 18px; font-weight: 800; color: #2c3e50; }
        .foot-data-money { font-size: 22px; font-weight: 800; color: #1a237e; }
        .footer-v-line { width: 1px; height: 40px; background: #e0e0e0; }
        .spinner-modern { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1a237e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-overlay { text-align: center; padding: 100px 0; color: #1a237e; font-weight: 700; }
        .empty-view { grid-column: 1/-1; text-align: center; padding: 80px; color: #95a5a6; }
      `}</style>
    </div>
  );
}

export default CustomerCardsPage;