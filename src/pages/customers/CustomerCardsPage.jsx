import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CustomerCardsPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHindi, setIsHindi] = useState(true);
  
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [price] = useState(60); // Default price agar backend se calculate karwana ho

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

  // --- Fetch Logic ---
  const fetchMonthlyData = useCallback(async () => {
    setLoading(true);
    try {
      // Pehle Monthly Bill (Totals) uthayenge
      const res = await axios.get(`${API}/api/monthly-bill`, {
        params: { month, year, price_per_kg: price }
      });
      
      // Saath hi Naga (Absents) nikalne ke liye saari entries mangwayenge
      const entriesRes = await axios.get(`${API}/api/monthly-entries`, {
        params: { month, year }
      });

      const rawData = res.data.data || [];
      const entries = entriesRes.data.data || [];

      // Naga calculate karne ka logic
      const formattedData = rawData.map(customer => {
        const customerEntries = entries.filter(e => e.name === customer.name && parseFloat(e.milk_quantity) > 0);
        const daysInMonth = new Date(year, month, 0).getDate();
        const nagaCount = daysInMonth - customerEntries.length;

        return {
          ...customer,
          naga: nagaCount > 0 ? nagaCount : 0
        };
      });

      setBills(formattedData);
    } catch (err) {
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  }, [API, month, year, price]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  return (
    <div className="cards-page-wrapper">
      <header className="cards-header">
        <div className="top-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h2>{t("Customer Report", "ग्राहक रिपोर्ट")}</h2>
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "EN" : "HI"}
          </button>
        </div>

        <div className="filter-section">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <main className="cards-container">
        {loading ? (
          <div className="loader">⌛ {t("Loading Cards...", "कार्ड लोड हो रहे हैं...")}</div>
        ) : bills.length > 0 ? (
          <div className="customer-grid">
            {bills.map((b) => (
              <div className="customer-card" key={b.user_id}>
                <div className="card-top">
                  <div className="user-icon">👤</div>
                  <div className="user-info">
                    <h3>{b.name}</h3>
                    <p className="month-tag">{months.find(m => m.v === parseInt(month)).n.split('/')[1]}</p>
                  </div>
                </div>

                <div className="card-stats">
                  <div className="stat-item">
                    <span className="label">{t("Total Milk", "कुल दूध")}</span>
                    <span className="value milk">{parseFloat(b.total_milk).toFixed(1)} kg</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">{t("Total Naga", "कुल नागा")}</span>
                    <span className="value naga">{b.naga} {t("Days", "दिन")}</span>
                  </div>
                  <div className="stat-item price-row">
                    <span className="label">{t("Total Amount", "कुल पैसे")}</span>
                    <span className="value amount">₹{parseFloat(b.total_money).toLocaleString()}</span>
                  </div>
                </div>
                
                <button className="view-detail-btn">{t("View Details", "विवरण देखें")}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("No Records Found", "कोई रिकॉर्ड नहीं मिला")}</div>
        )}
      </main>

      <style>{`
        .cards-page-wrapper { background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        
        /* Header */
        .cards-header { background: #1a237e; color: white; padding: 20px 15px; border-radius: 0 0 25px 25px; position: sticky; top: 0; z-index: 10; }
        .top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .back-btn { background: none; border: none; color: white; font-size: 30px; cursor: pointer; }
        .lang-btn { background: white; color: #1a237e; border: none; padding: 5px 12px; border-radius: 15px; font-weight: bold; }
        
        .filter-section { display: flex; gap: 10px; }
        .filter-section select { flex: 1; padding: 10px; border-radius: 10px; border: none; font-weight: bold; }

        /* Grid */
        .cards-container { padding: 15px; }
        .customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; }

        /* Card Style */
        .customer-card { 
          background: white; 
          border-radius: 20px; 
          padding: 15px; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
          display: flex; 
          flex-direction: column; 
          border: 1px solid #e0e0e0;
          transition: transform 0.2s;
        }
        .customer-card:active { transform: scale(0.97); }

        .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .user-icon { background: #e8eaf6; padding: 8px; border-radius: 12px; font-size: 20px; }
        .user-info h3 { font-size: 16px; margin: 0; color: #1a237e; }
        .month-tag { font-size: 11px; color: #666; margin: 0; }

        .card-stats { border-top: 1px dashed #eee; padding-top: 10px; flex-grow: 1; }
        .stat-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .stat-item .label { font-size: 12px; color: #757575; }
        .stat-item .value { font-size: 13px; font-weight: 700; }
        
        .milk { color: #2e7d32; }
        .naga { color: #d32f2f; }
        .price-row { margin-top: 10px; padding-top: 5px; border-top: 1px solid #f5f5f5; }
        .amount { color: #1a237e; font-size: 15px !important; }

        .view-detail-btn { 
          margin-top: 15px; 
          background: #f5f5f5; 
          border: none; 
          padding: 8px; 
          border-radius: 10px; 
          font-size: 12px; 
          font-weight: 600; 
          color: #1a237e;
          cursor: pointer;
        }

        .loader, .empty-state { text-align: center; padding: 50px; color: #666; font-weight: 600; }
      `}</style>
    </div>
  );
}

export default CustomerCardsPage;