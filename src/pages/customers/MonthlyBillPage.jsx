import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Purity - Monthly Bill Management System
 * Fixes: Alignment, Sticky Headers, & Clean Cards
 */

function MonthlyBillPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHindi, setIsHindi] = useState(true);
  const [translatedNames, setTranslatedNames] = useState({});
  const [isCalculated, setIsCalculated] = useState(false);
  
  const [modal, setModal] = useState({ show: false, msg: "", type: "info" });

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [price, setPrice] = useState("");

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

  const formatMilk = (qty) => {
    const num = parseFloat(qty);
    if (isNaN(num) || num === 0) return "0 kg";
    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);
    let res = "";
    if (kg > 0) res += `${kg}kg `;
    if (grams > 0) res += `${grams}g`;
    return res.trim() || "0 kg";
  };

  const showPopup = (msg, type = "info") => {
    setModal({ show: true, msg, type });
  };

  const fetchMonthlyBill = useCallback(async (isInitial = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/monthly-bill`, {
        params: { month, year, price_per_kg: price || 0 }
      });
      const data = res.data.data || [];
      setBills(data);

      if (isHindi && data.length > 0) {
        const names = data.map(b => b.name);
        const transRes = await axios.post(`${API}/api/translate-list`, { texts: names });
        setTranslatedNames(transRes.data);
      }

      if (isInitial) {
        showPopup(t("Welcome! Enter Rate.", "स्वागत है! बिल के लिए रेट डालें।"));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [API, month, year, price, isHindi,t]);

  useEffect(() => {
    fetchMonthlyBill(true);
  }, [fetchMonthlyBill]); // Run only once on mount

 useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (price && parseFloat(price) > 0) {
        handleAutoCalc();
    }
  }, 1000);
  return () => clearTimeout(delayDebounceFn);
}, [price, handleAutoCalc]);

  const handleAutoCalc = async () => {
    try {
      const res = await axios.get(`${API}/api/monthly-bill`, { params: { month, year, price_per_kg: price } });
      setBills(res.data.data || []);
      setIsCalculated(true);
      showPopup(t("Calculated!", "हिसाब हो गया है!"), "success");
    } catch (err) {
      console.error("Calculation error");
    }
  };

  const handleFinalSubmit = async () => {
    if (!isCalculated) {
      showPopup(t("Enter rate!", "पहले रेट डालें!"));
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/monthly-bill/save`, { month, year, price_per_kg: price });
      if (res.data.success) {
        showPopup(t("Sent!", "बिल भेज दिया गया है!"), "success");
      }
    } catch (err) {
      showPopup("Error saving bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-wrapper">
      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <div className="modal-icon">{modal.type === "success" ? "✅" : "📢"}</div>
            <p>{modal.msg}</p>
            <button className="modal-close" onClick={() => setModal({ ...modal, show: false })}>OK</button>
          </div>
        </div>
      )}

      <header className="report-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h1 className="title-text">{t("Billing Center", "बिलिंग सेंटर")}</h1>
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>{isHindi ? "English" : "हिंदी"}</button>
        </div>
        
        <div className="filters-container">
          <div className="select-group">
            <select value={month} onChange={(e) => {setMonth(parseInt(e.target.value)); setIsCalculated(false);}}>
              {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
            </select>
            <select value={year} onChange={(e) => {setYear(parseInt(e.target.value)); setIsCalculated(false);}}>
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="action-group">
            <div className="input-wrapper">
              <span className="currency-tag">₹</span>
              <input 
                type="number" 
                placeholder={t("Rate", "भाव")} 
                className="price-input" 
                value={price} 
                onChange={(e) => {setPrice(e.target.value); setIsCalculated(false);}} 
              />
            </div>
            <button className={`submit-btn ${isCalculated ? 'ready' : ''}`} onClick={handleFinalSubmit}>
              {isCalculated ? t("Send Bill", "बिल भेजें") : t("Enter Rate", "रेट भरें")}
            </button>
          </div>
        </div>
      </header>

      <main className="report-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t("Please wait...", "थोड़ा इंतज़ार कीजिए...")}</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th className="sticky-col">{t("Customer", "ग्राहक")}</th>
                  <th>{t("Total Milk", "कुल दूध")}</th>
                  <th>{t("Amount", "पैसे")}</th>
                </tr>
              </thead>
              <tbody>
                {bills.length > 0 ? bills.map((b) => (
                  <tr key={b.user_id} className="data-row">
                    <td className="sticky-col">{isHindi ? (translatedNames[b.name] || b.name) : b.name}</td>
                    <td className="milk-cell">{formatMilk(b.total_milk)}</td>
                    <td>{price > 0 ? <span className="money-badge">₹{Math.round(b.total_money).toLocaleString()}</span> : "---"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{padding:'40px', textAlign:'center', color: '#999'}}>{t("No records found.", "कोई रिकॉर्ड नहीं मिला।")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        :root { --primary: #1a237e; --accent: #ffc107; --bg: #f4f7f6; }
        .report-wrapper { background: var(--bg); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .modal-box { background: white; padding: 25px; border-radius: 20px; width: 85%; max-width: 320px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .modal-icon { font-size: 40px; margin-bottom: 10px; }
        .modal-close { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 12px; width: 100%; cursor: pointer; margin-top: 15px; font-weight: bold; font-size: 16px; }
        
        /* Header & Filters */
        .report-header { background: var(--primary); padding: 15px; color: white; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .title-text { font-size: 20px; margin: 0; font-weight: 700; letter-spacing: 0.5px; }
        .back-btn { background: rgba(255,255,255,0.1); border: none; color: white; font-size: 28px; cursor: pointer; height: 35px; width: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .lang-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
        
        .filters-container { display: flex; flex-direction: column; gap: 12px; }
        .select-group { display: flex; gap: 10px; }
        .select-group select { flex: 1; padding: 12px; border-radius: 12px; border: none; font-weight: 600; font-size: 14px; outline: none; background: white; color: #333; }
        
        .action-group { display: flex; gap: 10px; align-items: center; }
        .input-wrapper { position: relative; flex: 1; }
        .currency-tag { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #1a237e; font-weight: bold; font-size: 16px; }
        .price-input { width: 100%; padding: 12px 12px 12px 30px; border-radius: 12px; border: none; font-weight: bold; outline: none; font-size: 16px; box-sizing: border-box; }
        
        .submit-btn { flex: 1.5; padding: 12px; border-radius: 12px; border: none; background: #3949ab; color: white; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; }
        .submit-btn.ready { background: var(--accent); color: #1a237e; box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4); }

        /* Table Content */
        .report-content { padding: 15px; }
        .table-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .report-table { width: 100%; border-collapse: collapse; }
        .report-table th { background: #f8f9fa; padding: 15px 10px; font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #eee; }
        
        .data-row td { padding: 15px 10px; text-align: center; border-bottom: 1px solid #f0f0f0; font-size: 15px; color: #333; }
        .sticky-col { position: sticky; left: 0; background: white !important; font-weight: 700; color: var(--primary); text-align: left !important; border-right: 1px solid #eee; min-width: 110px; z-index: 10; }
        
        .milk-cell { font-weight: 700; color: #2ecc71; }
        .money-badge { background: #fff9db; padding: 6px 10px; border-radius: 8px; font-weight: 800; color: #926e00; display: inline-block; border: 1px solid #ffe066; }

        /* Utilities */
        .loading-container { text-align: center; padding: 60px 20px; color: #666; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default MonthlyBillPage;