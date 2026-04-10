import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

/**
 * Purity - Customer Billing Cards (Updated with Filters)
 * Features: Month/Year Selection, Hindi Toggle, Auto-Transliteration
 */

function CustomerCardsPage() {
  const today = new Date();
  
  // States for Filter
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHindi, setIsHindi] = useState(true);
  const [translatedNames, setTranslatedNames] = useState({});

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  const t = (en, hi) => (isHindi ? hi : en);

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
      setCards([]); // Clear cards on error
    } finally {
      setLoading(false);
    }
  }, [API, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return (
    <div className="page">
      <header className="page-header">
        <div className="header-top">
          <h1 className="title">{t("Billing Cards", "बिलिंग कार्ड्स")}</h1>
          <button className="lang-toggle" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>

        <div className="filter-bar">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="filter-select"
          >
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>

          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="filter-select"
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="loader-box">
          <div className="spinner"></div>
          <p>{t("Fetching Data...", "डाटा आ रहा है...")}</p>
        </div>
      ) : (
        <div className="card-grid">
          {cards.length > 0 ? cards.map((c, i) => (
            <div key={i} className="card">
              <div className="card-top">
                <h2 className="name">
                  {isHindi ? (translatedNames[c.name] || c.name) : c.name}
                </h2>
                <span className="badge">{c.month}/{c.year}</span>
              </div>

              <div className="stats-container">
                <div className="stat-row">
                  <span className="label">🥛 {t("Milk", "कुल दूध")}:</span>
                  <span className="val milk">{c.total_milk} Kg</span>
                </div>
                
                <div className="stat-row">
                  <span className="label">💰 {t("Money", "दूध के पैसे")}:</span>
                  <span className="val money">₹{Math.round(c.total_money)}</span>
                </div>

                <div className="stat-row">
                  <span className="label">⚠️ {t("Gaps", "नागा (दिन)")}:</span>
                  <span className="val naga">{c.naga_days}</span>
                </div>

                <div className="divider"></div>

                <div className="stat-row final-bill">
                  <span className="label">{t("Total Bill", "कुल बिल")}:</span>
                  <span className="val bill">₹{Math.round(c.bill_total)}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <p>{t("No records found for this period.", "इस समय का कोई रिकॉर्ड नहीं मिला।")}</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .page { padding: 20px; background: #f0f2f5; min-height: 100vh; font-family: sans-serif; }
        
        .page-header { margin-bottom: 25px; }
        
        .header-top { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 15px; 
        }

        .title { margin: 0; color: #1a237e; font-size: 22px; font-weight: 800; }
        
        .lang-toggle { 
          background: white; border: 1.5px solid #1a237e; color: #1a237e; 
          padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer;
        }

        .filter-bar { display: flex; gap: 10px; }
        
        .filter-select { 
          flex: 1; padding: 12px; border-radius: 12px; border: 1px solid #ddd;
          background: white; font-weight: 600; outline: none; color: #333;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .card-grid { 
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 20px; 
        }

        .card { 
          background: white; border-radius: 20px; padding: 20px; 
          box-shadow: 0 8px 20px rgba(0,0,0,0.06); border: 1px solid #eee;
        }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .name { margin: 0; color: #1a237e; font-size: 19px; }
        .badge { background: #e8eaf6; color: #3f51b5; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }

        .stats-container { display: flex; flex-direction: column; gap: 10px; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; }
        .label { color: #666; font-size: 14px; }
        .val { font-weight: 700; font-size: 15px; }

        .milk { color: #2ecc71; }
        .money { color: #f39c12; }
        .naga { color: #e74c3c; }
        .divider { height: 1px; background: #f0f0f0; margin: 5px 0; }
        
        .final-bill { font-size: 17px; margin-top: 5px; }
        .bill { color: white; background: #1a237e; padding: 4px 10px; border-radius: 8px; }

        .loader-box { text-align: center; margin-top: 50px; }
        .spinner { 
          width: 40px; height: 40px; border: 4px solid #f3f3f3; 
          border-top: 4px solid #1a237e; border-radius: 50%; 
          animation: spin 1s linear infinite; margin: 0 auto 15px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state { 
          grid-column: 1 / -1; text-align: center; padding: 60px; 
          background: white; border-radius: 20px; color: #999;
        }
        .empty-icon { font-size: 50px; margin-bottom: 10px; }

        @media (max-width: 480px) {
          .filter-bar { flex-direction: row; }
          .filter-select { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}

export default CustomerCardsPage;