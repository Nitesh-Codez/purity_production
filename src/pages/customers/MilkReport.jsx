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
  
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";
  const t = (en, hi) => (isHindi ? hi : en);

  // मात्रा को सुंदर नाम देने के लिए ऑप्शंस
  const milkOptions = [
    { label: "Holiday / नागा", value: 0.00 },
    { label: "250g", value: 0.25 },
    { label: "500g", value: 0.50 },
    { label: "500g 250g", value: 0.75 },
    { label: "1kg", value: 1.00 },
    { label: "1kg 250g", value: 1.25 },
    { label: "1kg 500g", value: 1.50 },
    { label: "2kg", value: 2.00 },
    { label: "2kg 500g", value: 2.50 },
    { label: "3kg", value: 3.00 },
  ];

  const months = [
    { v: 1, n: "January / जनवरी" }, { v: 2, n: "February / फरवरी" },
    { v: 3, n: "March / मार्च" }, { v: 4, n: "April / अप्रैल" },
    { v: 5, n: "May / मई" }, { v: 6, n: "June / जून" },
    { v: 7, n: "July / जुलाई" }, { v: 8, n: "August / अगस्त" },
    { v: 9, n: "September / सितंबर" }, { v: 10, n: "October / अक्टूबर" },
    { v: 11, n: "November / नवंबर" }, { v: 12, n: "December / दिसंबर" }
  ];

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/monthly-entries`, {
        params: { month, year }
      });
      
      const data = res.data.data || [];
      setReportData(data);

      const uniqueNames = [...new Set(data.map(item => item.name))].sort();
      setCustomers(uniqueNames);

      const uniqueDates = [...new Set(data.map(item => item.delivery_date.split("T")[0]))].sort();
      setDates(uniqueDates);

      if (isHindi && uniqueNames.length > 0) {
        try {
          const transRes = await axios.post(`${API}/api/translate-list`, { texts: uniqueNames });
          setTranslatedNames(transRes.data);
        } catch (e) { 
          console.error("Translation Error", e); 
        }
      }
    } catch (err) {
      console.error("Monthly Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [API, month, year, isHindi]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // टेबल सेल में क्या दिखाना है, उसे तय करने वाला फंक्शन
  const getMilkDisplay = (date, name) => {
    const entry = reportData.find(item => 
      item.delivery_date.split("T")[0] === date && item.name === name
    );
    if (!entry) return "-";
    
    const qty = parseFloat(entry.milk_quantity);
    
    if (qty === 0) return <span className="naga-text">{t("Naga", "नागा")}</span>;

    // वैल्यू के हिसाब से लेबल ढूंढें
    const matchedOption = milkOptions.find(opt => opt.value === qty);
    return matchedOption ? matchedOption.label : `${qty}kg`;
  };

  return (
    <div className="report-wrapper">
      <header className="report-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h1>{t("Monthly Sheet", "महीने की शीट")}</h1>
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>

        <div className="filters">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <main className="report-content">
        {loading ? (
          <div className="center-msg">{t("Fetching data...", "डाटा लोड हो रहा है...")}</div>
        ) : reportData.length === 0 ? (
          <div className="center-msg">{t("No record found", "कोई रिकॉर्ड नहीं मिला")}</div>
        ) : (
          <div className="table-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th className="sticky-col">{t("Date", "तारीख")}</th>
                  {customers.map(name => (
                    <th key={name}>
                      {isHindi ? (translatedNames[name] || name) : name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map(date => (
                  <tr key={date}>
                    <td className="sticky-col date-val">
                      {new Date(date).toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit'})}
                    </td>
                    {customers.map(name => (
                      <td key={name + date} className="qty-val">
                        {getMilkDisplay(date, name)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        .report-wrapper { background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        .report-header { background: #1a237e; color: white; padding: 15px 20px; border-radius: 0 0 20px 20px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .back-btn { background: none; border: none; color: white; font-size: 32px; cursor: pointer; padding: 0 10px; }
        .lang-btn { background: white; color: #1a237e; border: none; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; }
        
        .filters { display: flex; gap: 10px; }
        .filters select { flex: 1; padding: 10px; border-radius: 10px; border: none; font-weight: 600; outline: none; background: rgba(255,255,255,0.9); }

        .report-content { padding: 12px; }
        .table-card { background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: auto; max-height: 78vh; }
        
        .report-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .report-table th, .report-table td { border: 1px solid #eef0f2; padding: 12px 10px; text-align: center; font-size: 13px; }
        
        .report-table th { background: #f1f3f9; color: #1a237e; font-weight: 700; position: sticky; top: 0; z-index: 20; white-space: nowrap; }
        
        /* तारीख वाले कॉलम की विड्थ कम और स्थिर रखने के लिए */
        .sticky-col { 
          position: sticky; 
          left: 0; 
          background: #fff; 
          z-index: 30; 
          border-right: 2.5px solid #1a237e !important; 
          width: 60px; 
          max-width: 60px;
          font-weight: bold; 
        }
        
        thead .sticky-col { background: #f1f3f9; z-index: 40; }
        
        .date-val { color: #444; font-size: 12px; }
        .qty-val { color: #2e7d32; font-weight: 600; white-space: nowrap; }
        .naga-text { color: #d32f2f; font-weight: 800; font-size: 11px; text-transform: uppercase; }

        .center-msg { text-align: center; padding: 80px 20px; color: #666; font-size: 15px; }
      `}</style>
    </div>
  );
}

export default MilkReport;