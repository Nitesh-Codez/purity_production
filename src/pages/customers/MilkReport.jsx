import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MilkReport() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHindi, setIsHindi] = useState(true);
  const [translatedNames, setTranslatedNames] = useState({});
  const [customers, setCustomers] = useState([]);
  const [dates, setDates] = useState([]);
  const [customerProfiles, setCustomerProfiles] = useState({});

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

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

  const formatMilkLabel = (qty) => {
    const num = parseFloat(qty);
    if (num === 0) return <span className="naga-text">{t("Naga", "नागा")}</span>;
    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);
    let result = "";
    if (kg > 0) result += `${kg}kg `;
    if (grams === 750) result += "500g 250g";
    else if (grams > 0) result += `${grams}g`;
    return result.trim();
  };

  const formatTotal = (totalQty) => {
    const num = parseFloat(totalQty);
    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);
    if (kg === 0 && grams === 0) return "0";
    if (kg > 0 && grams === 0) return `${kg}kg`;
    if (kg === 0 && grams > 0) return `${grams}g`;
    return `${kg}kg ${grams}g`;
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/monthly-entries`, { params: { month, year } });
      const data = res.data.data || [];
      setReportData(data);

      const custRes = await axios.get(`${API}/api/customers`);
      const profiles = {};
      custRes.data.data.forEach(c => { profiles[c.name] = c.daily_milk; });
      setCustomerProfiles(profiles);

      const uniqueNames = [...new Set(data.map(item => item.name))].sort();
      setCustomers(uniqueNames);

      const uniqueDates = [...new Set(data.map(item => item.delivery_date.split("T")[0]))].sort();
      setDates(uniqueDates);

      if (isHindi && uniqueNames.length > 0) {
        try {
          const transRes = await axios.post(`${API}/api/translate-list`, { texts: uniqueNames });
          setTranslatedNames(transRes.data);
        } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [API, month, year, isHindi]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // बैकएंड में हिसाब सेव करने के लिए फंक्शन
  const saveReportToDB = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/save-monthly-total`, { month, year });
      if (res.data.success) {
        alert(t("Monthly totals calculated and saved to DB!", "महीने का कुल हिसाब कैलकुलेट होकर DB में सेव हो गया!"));
      }
    } catch (err) {
      alert("Error saving to DB");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCellContent = (date, name) => {
    const entry = reportData.find(item => item.delivery_date.split("T")[0] === date && item.name === name);
    if (!entry) return { label: "-", qty: 0, isLess: false };
    const qty = parseFloat(entry.milk_quantity);
    const dailyNormal = parseFloat(customerProfiles[name] || 0.50);
    const isLess = qty > 0 && qty < dailyNormal;
    return { label: formatMilkLabel(qty), qty, isLess };
  };

  const getDateTotal = (date) => {
    const total = reportData
      .filter(item => item.delivery_date.split("T")[0] === date)
      .reduce((sum, item) => sum + parseFloat(item.milk_quantity), 0);
    return formatTotal(total);
  };

  const getCustomerTotal = (name) => {
    const total = reportData
      .filter(item => item.name === name)
      .reduce((sum, item) => sum + parseFloat(item.milk_quantity), 0);
    return formatTotal(total);
  };

  return (
    <div className="report-wrapper">
      <header className="report-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h1>{t("Monthly Sheet", "महीने की शीट")}</h1>
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>{isHindi ? "English" : "हिंदी"}</button>
        </div>
        <div className="filters">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {months.map(m => (
              <option key={m.v} value={m.v}>{m.n}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="save-btn" onClick={saveReportToDB}>
            {t("Save Totals", "हिसाब सेव करें")}
          </button>
        </div>
      </header>

      <main className="report-content">
        {loading ? (
          <div className="center-msg">{t("Loading...", "डाटा आ रहा है...")}</div>
        ) : (
          <div className="table-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th className="sticky-col first-header" style={{ width: '85px' }}>{t("Date", "तारीख")}</th>
                  {customers.map(name => (
                    <th key={name} style={{ width: '105px' }}>
                      {isHindi ? (translatedNames[name] || name) : name}
                    </th>
                  ))}
                  <th className="total-col-head" style={{ width: '105px' }}>{t("Total", "कुल")}</th>
                </tr>
              </thead>
              <tbody>
                {dates.map(date => (
                  <tr key={date}>
                    <td className="sticky-col date-val">
                      {new Date(date).toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit'})}
                    </td>
                    {customers.map(name => {
                      const cell = getCellContent(date, name);
                      return (
                        <td key={name + date} className={`qty-val ${cell.isLess ? 'less-qty' : ''}`}>
                          {cell.label}
                        </td>
                      );
                    })}
                    <td className="row-total">{getDateTotal(date)}</td>
                  </tr>
                ))}
                <tr className="grand-total-row">
                  <td className="sticky-col total-label">{t("Total", "कुल")}</td>
                  {customers.map(name => (
                    <td key={name + 'total'}>{getCustomerTotal(name)}</td>
                  ))}
                  <td className="final-sum">
                    {formatTotal(reportData.reduce((s, i) => s + parseFloat(i.milk_quantity), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        .report-wrapper { background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        .report-header { background: #1a237e; color: white; padding: 15px 20px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .back-btn { background: none; border: none; color: white; font-size: 32px; cursor: pointer; line-height: 1; }
        .lang-btn { background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 5px 12px; border-radius: 15px; font-weight: bold; font-size: 10px; cursor: pointer; }
        .filters { display: flex; gap: 8px; align-items: center; }
        .filters select { flex: 1; padding: 10px; border-radius: 8px; border: none; font-weight: 600; outline: none; font-size: 13px; }
        
        .save-btn { 
          background: #ffc107; 
          color: #000; 
          border: none; 
          padding: 10px 12px; 
          border-radius: 8px; 
          font-weight: 800; 
          font-size: 12px; 
          cursor: pointer;
          white-space: nowrap;
        }

        .report-content { padding: 8px; }
        .table-card { background: white; border-radius: 12px; overflow: auto; max-height: 78vh; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #aaa; }
        
        .report-table { 
          width: 100%; 
          border-collapse: separate; 
          border-spacing: 0; 
          table-layout: fixed; 
          min-width: ${190 + customers.length * 105}px; 
        }
        
        .report-table th, .report-table td { 
          border: 0.5px solid #ccc; 
          padding: 12px 2px; 
          text-align: center; 
          font-size: 12px; 
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .report-table th { 
          background: #c0ffa3; 
          color: #000; 
          font-weight: 800;
          position: sticky; 
          top: 0; 
          z-index: 50; 
          border-bottom: 2.5px solid #1a237e; 
          text-transform: uppercase;
        }
        
        .sticky-col { 
          position: sticky; 
          left: 0; 
          background: #fff !important; 
          z-index: 40 !important; 
          border-right: 3px solid #1a237e !important; 
          font-weight: bold; 
        }
        
        .first-header { z-index: 60 !important; background: #f8f9fa !important; }
        .total-label { background: #1a237e !important; color: white !important; text-align: center; }

        .less-qty { background-color: #ffebee !important; color: #c62828 !important; } 
        .qty-val { color: #2e7d32; font-weight: 700; }
        .naga-text { color: #d32f2f; font-weight: 900; font-size: 9px; }
        
        .row-total { background: #f8f9fa; font-weight: 800; color: #000; border-left: 2px solid #1a237e; }
        .grand-total-row { background: #1a237e; color: white; font-weight: bold; position: sticky; bottom: 0; z-index: 45; }
        .grand-total-row td { color: white !important; border-top: 2px solid #fff; }
        
        .final-sum { background: #ffc107 !important; color: #000 !important; font-weight: 900; border: 2px solid #000 !important; }
        .center-msg { text-align: center; padding: 50px; color: #666; font-weight: bold; }
      `}</style>
    </div>
  );
}

export default MilkReport;