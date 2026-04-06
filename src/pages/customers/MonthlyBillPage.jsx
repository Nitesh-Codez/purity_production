import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Purity - Monthly Bill Management System
 * Optimized UI: Compact Rate Box & Prominent Action Button
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
    if (grams === 750) res += "500g 250g";
    else if (grams > 0) res += `${grams}g`;
    return res.trim();
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

      if(isInitial) {
        showPopup(t("Welcome! Please enter Rate.", "स्वागत है! बिल निकालने के लिए रेट डालें।"));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [API, month, year, price, isHindi]);

  useEffect(() => {
    fetchMonthlyBill(true);
  }, [fetchMonthlyBill]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (price && parseFloat(price) > 0) {
        handleAutoCalc();
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [price]);

  const handleAutoCalc = async () => {
    try {
      const res = await axios.get(`${API}/api/monthly-bill`, {
        params: { month, year, price_per_kg: price }
      });
      setBills(res.data.data || []);
      setIsCalculated(true);
      showPopup(t("Calculated!", "बिल बन गया है! अब आप भेज सकते हैं।"), "success");
    } catch (err) {
      console.log("Auto calc error");
    }
  };

  const handleFinalSubmit = async () => {
    if (!isCalculated) {
      showPopup(t("Enter rate!", "पहले रेट डालें!"));
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/monthly-bill/save`, {
        month, year, price_per_kg: price
      });
      if (res.data.success) {
        showPopup(t("Sent!", "बिल सफलतापूर्वक भेज दिया गया है!"), "success");
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
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
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
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <button 
              className={`submit-btn ${isCalculated ? 'ready' : ''}`} 
              onClick={handleFinalSubmit}
            >
              {isCalculated ? t("Send Bill", "बिल भेजें") : t("Rate?", "रेट?")}
            </button>
          </div>
        </div>
      </header>

      <main className="report-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t("Calculating...", "थोड़ा इंतज़ार कीजिए, हिसाब जोड़ा जा रहा है...")}</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th className="sticky-col">{t("Customer", "ग्राहक")}</th>
                  <th>{t("Total Milk", "कुल दूध")}</th>
                  <th className="amount-head">{t("Amount (₹)", "पैसे")}</th>
                </tr>
              </thead>
              <tbody>
                {bills.length > 0 ? (
                  bills.map((b) => (
                    <tr key={b.user_id} className="data-row">
                      <td className="sticky-col customer-cell">
                        {isHindi ? (translatedNames[b.name] || b.name) : b.name}
                      </td>
                      <td className="milk-cell">{formatMilk(b.total_milk)}</td>
                      <td className="money-cell">
                        {price > 0 ? (
                          <span className="money-badge">₹{parseFloat(b.total_money).toLocaleString()}</span>
                        ) : (
                          <span className="placeholder-dash">---</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">{t("No Data Found", "डाटा नहीं मिला")}</td>
                  </tr>
                )}
              </tbody>
              {bills.length > 0 && (
                <tfoot>
                  <tr className="footer-row">
                    <td className="sticky-col">{t("Total", "कुल योग")}</td>
                    <td>{formatMilk(bills.reduce((s, i) => s + parseFloat(i.total_milk), 0))}</td>
                    <td className="grand-total">
                      ₹{bills.reduce((s, i) => s + parseFloat(i.total_money), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </main>

      <style>{`
        :root { --primary: #1a237e; --accent: #ffc107; --success: #2ecc71; --bg: #f4f7f6; }
        .report-wrapper { background: var(--bg); min-height: 100vh; font-family: 'Poppins', sans-serif; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px); }
        .modal-box { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 350px; text-align: center; }
        .modal-icon { font-size: 40px; margin-bottom: 15px; }
        .modal-close { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 50px; width: 100%; cursor: pointer; font-weight: bold; }
        .report-header { background: var(--primary); padding: 15px; color: white; position: sticky; top: 0; z-index: 1000; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .title-text { font-size: 18px; font-weight: 700; margin: 0; }
        .back-btn { background: none; border: none; color: white; font-size: 24px; }
        .lang-btn { background: rgba(255,255,255,0.1); border: 1px solid white; color: white; padding: 4px 10px; border-radius: 8px; font-size: 12px; }
        .filters-container { display: flex; flex-direction: column; gap: 10px; }
        .select-group { display: flex; gap: 8px; }
        .select-group select { flex: 1; padding: 10px; border-radius: 10px; border: none; font-weight: 600; }
        .action-group { display: flex; gap: 50px; align-items: center; }
        .input-wrapper { position: relative; width: 90px; }
        .currency-tag { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #444; font-weight: bold; }
        .price-input { width: 100%; padding: 10px 8px 10px 22px; border-radius: 10px; border: none; font-weight: bold; }
        .submit-btn { flex: 1; padding: 10px; border-radius: 10px; border: none; background: #3949ab; color: #aab6ff; font-weight: 800; font-size: 15px; }
        .submit-btn.ready { background: var(--accent); color: #1a237e; }
        .report-content { padding: 12px; }
        .table-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .report-table { width: 100%; border-collapse: collapse; }
        .report-table th { background: #f8f9fa; padding: 12px 8px; font-size: 11px; color: #666; border-bottom: 2px solid #eee; }
        .data-row td { padding: 12px 8px; text-align: center; border-bottom: 1px solid #f1f1f1; font-size: 14px; }
        .sticky-col { position: sticky; left: 0; background: white !important; z-index: 10; border-right: 2px solid #f1f1f1; text-align: left !important; min-width: 90px; font-weight: 700; color: var(--primary); }
        .milk-cell { font-weight: 600; color: #27ae60; }
        .money-badge { background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 6px; font-weight: 800; border: 1px solid #ffeeba; }
        .footer-row { background: var(--primary); color: white; font-weight: bold; }
        .footer-row td { padding: 12px; }
        .grand-total { background: var(--accent); color: black !important; }
        .loading-container { text-align: center; padding: 50px; }
        .spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default MonthlyBillPage;