import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MonthlyBillPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHindi, setIsHindi] = useState(true);
  const [translatedNames, setTranslatedNames] = useState({});

  // Details Modal State
  const [detailModal, setDetailModal] = useState({ 
    show: false, 
    data: [], 
    customerName: "", 
    dailyLimit: 0,
    loading: false 
  });

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year] = useState(today.getFullYear());

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

  // Format milk quantity as 250g, 500g, 500g 250g, 1kg, 2kg
  const formatMilk = (qty) => {
    const num = parseFloat(qty);
    if (isNaN(num) || num === 0) return "0";
    const kg = Math.floor(num);
    let grams = Math.round((num - kg) * 1000);
    let res = "";
    if (kg > 0) res += `${kg}kg `;
    if (grams === 750) res += "500g 250g";
    else if (grams === 500) res += "500g";
    else if (grams === 250) res += "250g";
    else if (grams > 0) res += `${grams}g`;
    return res.trim();
  };

  // --- Fetch Main Summary Cards ---
  const fetchMonthlyBill = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/monthly-report/summary`, { params: { month, year } });
      const data = res.data || [];
      setBills(data);

      if (data.length > 0) {
        const names = data.map(b => b.name);
        const transRes = await axios.post(`${API}/api/translate-list`, { texts: names });
        setTranslatedNames(transRes.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [API, month, year]);

  useEffect(() => { fetchMonthlyBill(); }, [fetchMonthlyBill]);

  // --- View Details for Customer ---
  const handleViewDetails = async (customer) => {
    setDetailModal({ 
      show: true, 
      data: [], 
      customerName: customer.name, 
      dailyLimit: parseFloat(customer.default_milk_quantity || 0), 
      loading: true 
    });

    try {
      const res = await axios.get(`${API}/api/monthly-report/details/${customer.id}`, { params: { month, year } });
      setDetailModal(prev => ({ ...prev, data: res.data.entries, loading: false }));
    } catch (err) {
      setDetailModal(prev => ({ ...prev, loading: false }));
      alert("विवरण लोड नहीं हो पाया");
    }
  };

  return (
    <div className="report-wrapper">

      {/* --- DETAIL MODAL --- */}
      {detailModal.show && (
        <div className="modal-overlay" onClick={() => setDetailModal({...detailModal, show: false})}>
          <div className="detail-box" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
              <div className="header-icon">📋</div>
              <h3>{isHindi ? (translatedNames[detailModal.customerName] || detailModal.customerName) : detailModal.customerName}</h3>
              <p>{t("Monthly Log", "महीने का विवरण")}</p>
            </div>

            <div className="detail-list">
              {detailModal.loading ? (
                <div className="inner-loader">
                  <div className="spinner"></div>
                  <p>लोड हो रहा है...</p>
                </div>
              ) : detailModal.data.length > 0 ? (
                detailModal.data.map((entry, idx) => {
                  const qty = parseFloat(entry.daily_milk);
                  const isNaga = qty === 0;
                  const isLess = qty > 0 && qty < detailModal.dailyLimit;

                  return (
                    <div key={idx} className={`detail-item ${isNaga ? 'is-naga' : isLess ? 'is-less' : ''}`}>
                      <div className="date-info">
                        <span className="day-num">{new Date(entry.delivery_date).getDate()}</span>
                        <span className="day-text">{t("Date", "तारीख")}</span>
                      </div>
                      <div className="qty-info">
                        <span className="qty-val">
                          {isNaga ? t("ABSENT", "नागा ❌") : formatMilk(qty)}
                        </span>
                        {isLess && <span className="less-tag">{t("KAM", "कम")}</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data">{t("No records found", "कोई रिकॉर्ड नहीं मिला")}</div>
              )}
            </div>
            <button className="modal-close-btn" onClick={() => setDetailModal({...detailModal, show: false})}>
              {t("GOT IT", "ठीक है")}
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE --- */}
      <header className="report-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h1 className="main-title">{t("Billing", "बिलिंग")}</h1>
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>
        <div className="filter-card">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
        </div>
      </header>

      <main className="report-content">
        {loading && <div className="main-loader">Loading...</div>}
        <div className="card-grid">
          {bills.map((b) => (
            <div className="cust-card" key={b.id} onClick={() => handleViewDetails(b)}>
              <div className="cust-name">{isHindi ? (translatedNames[b.name] || b.name) : b.name}</div>
              <div className="cust-data">
                <div className="data-row">
                  <span>कुल दूध:</span> <b>{formatMilk(b.total_milk)}</b>
                </div>
                <div className="data-row">
                  <span>कुल नागा:</span> <b>{b.total_naga ?? 0}</b>
                </div>
                <div className="data-row">
                  <span>कुल पैसे:</span> <b className="red-text">₹{b.total_money}</b>
                </div>
              </div>
              <div className="view-link">विवरण देखें ›</div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}

export default MonthlyBillPage;