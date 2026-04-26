import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MilkEntry() {
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [milk, setMilk] = useState({});
  const [translatedData, setTranslatedData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState({ text: "", type: "" });

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  const t = (en, hi) => (isHindi ? hi : en);

  const milkOptions = [
    { label: "Holiday / नागा", value: "0" },
    { label: "250g", value: "0.25" },
    { label: "500g", value: "0.50" },
    { label: "500g 250g", value: "0.75" },
    { label: "1kg", value: "1.00" },
    { label: "1kg 250g", value: "1.25" },
    { label: "1kg 500g", value: "1.50" },
    { label: "2kg", value: "2.00" },
    { label: "2kg 500g", value: "2.50" },
    { label: "3kg", value: "3.00" },
  ];

  // Desi Pronunciation Logic
  const getHindiPronunciation = (val) => {
    const qty = parseFloat(val);
    if (qty === 0) return "नागा";
    if (qty === 0.25) return "ढाई सौ ग्राम";
    if (qty === 0.50) return "आधा किलो";
    if (qty === 0.75) return "तीन पाव";
    if (qty === 1.00) return "एक किलो";
    if (qty === 1.25) return "सवा किलो";
    if (qty === 1.50) return "डेढ़ किलो";
    if (qty === 2.00) return "दो किलो";
    if (qty === 2.50) return "ढाई किलो";
    if (qty === 3.00) return "तीन किलो";
    return `${qty} किलो`;
  };

  // Month names for clean Hindi voice
  const hindiMonths = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/customers`);
      const data = res.data.data;
      setCustomers(data);

      const savedMilkData = JSON.parse(localStorage.getItem('last_milk_entries')) || {};
      const defaults = {};
      const namesToTranslate = [];

      data.forEach(c => {
        const lastVal = savedMilkData[c.id];
        const dbDefault = c.default_milk_quantity !== null ? parseFloat(c.default_milk_quantity).toFixed(2) : "0.50";
        defaults[c.id] = lastVal !== undefined ? lastVal : dbDefault;
        if (c.name) namesToTranslate.push(c.name);
      });
      setMilk(defaults);

      if (isHindi && namesToTranslate.length > 0) {
        try {
          const transRes = await axios.post(`${API}/api/translate-list`, {
            texts: [...new Set(namesToTranslate)]
          });
          setTranslatedData(transRes.data);
        } catch (err) {
          console.error("Transliteration error:", err);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [API, isHindi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveMilk = async (id) => {
    const qty = milk[id];
    const customer = customers.find(c => c.id === id);
    const selectedOption = milkOptions.find(o => parseFloat(o.value) === parseFloat(qty));
    const customerName = isHindi ? (translatedData[customer.name] || customer.name) : customer.name;
    const displayLabel = parseFloat(qty) === 0 ? t("Holiday", "नागा") : selectedOption?.label;

    try {
      await axios.post(`${API}/api/save-entry`, {
        user_id: id,
        milk_quantity: parseFloat(qty),
        delivery_date: selectedDate
      });

      const currentSaved = JSON.parse(localStorage.getItem('last_milk_entries')) || {};
      currentSaved[id] = qty;
      localStorage.setItem('last_milk_entries', JSON.stringify(currentSaved));

      // Date Formatting for UI (DD-MM-YYYY)
      const dateParts = selectedDate.split('-');
      const formattedDateUI = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      
      // Date Formatting for Voice (22 April)
      const day = parseInt(dateParts[2]);
      const month = hindiMonths[parseInt(dateParts[1]) - 1];
      const voiceDate = `${day} ${month}`;

      const desiQty = getHindiPronunciation(qty);

      // UI Message Text
      const msgText = `${customerName}: ${displayLabel} (${formattedDateUI}) ${t("Saved", "चड़ गया")}`;

      // Voice Text logic (Clean Hindi)
      const voiceText = isHindi 
        ? `${customerName} का ${voiceDate} का ${desiQty} दूध चड़ गया है` 
        : `${customerName}'s ${displayLabel} for ${day} ${dateParts[1]} has been saved`;

      setMessage({ text: msgText, type: "success" });
      speak(voiceText);

      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      alert("Error saving data");
    }
  };

  return (
    <div className="entry-wrapper">
      <header className="entry-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h1>{t("Milk Entry", "दूध चढ़ाएं")}</h1>
          <button className="lang-btn" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>

        <div className="date-selector">
          <label>{t("Date:", "तारीख:")}</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
        </div>
      </header>

      <main className="entry-list">
        {message.text && <div className={`toast-msg ${message.type}`}>{message.text}</div>}
        
        {customers.map((c) => {
          const currentQty = milk[c.id] || "0.50";
          const matchedOption = milkOptions.find(o => parseFloat(o.value) === parseFloat(currentQty));
          const optionLabel = matchedOption ? matchedOption.label : `${currentQty}kg`;

          return (
            <div key={c.id} className="entry-card">
              <div className="info">
                <span className="name">
                  {isHindi ? (translatedData[c.name] || c.name) : c.name}
                </span>
                <span className="phone">📞 {c.mobile}</span>
              </div>

              <div className="actions-v2">
                <select 
                  value={currentQty} 
                  onChange={(e) => setMilk({ ...milk, [c.id]: e.target.value })}
                  className="qty-dropdown"
                >
                  {milkOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <button 
                  className={`big-save-btn ${parseFloat(currentQty) === 0 ? 'is-naga' : ''}`}
                  onClick={() => saveMilk(c.id)}
                >
                  <span className="btn-label">{optionLabel}</span>
                  <span className="btn-sub">{t("Save", "चढ़ाएं")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </main>

      <style>{`
        .entry-wrapper { background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; padding-bottom: 40px; }
        .entry-header { background: #1a237e; color: white; padding: 15px 20px; border-radius: 0 0 25px 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); position: sticky; top: 0; z-index: 100; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .header-top h1 { font-size: 20px; margin: 0; font-weight: 600; }
        .back-btn { background: rgba(255,255,255,0.1); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .lang-btn { background: white; color: #1a237e; border: none; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; cursor: pointer; }
        .date-selector { background: rgba(255,255,255,0.15); padding: 8px 15px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .date-selector input { border: none; padding: 6px 10px; border-radius: 8px; font-weight: bold; font-family: inherit; outline: none; }
        .entry-list { padding: 15px; }
        .toast-msg { position: fixed; top: 120px; left: 50%; transform: translateX(-50%); background: #2e7d32; color: white; padding: 12px 25px; border-radius: 30px; z-index: 1000; box-shadow: 0 5px 15px rgba(0,0,0,0.2); font-weight: 600; text-align: center; white-space: normal; width: 80%; }
        .entry-card { background: white; margin-bottom: 15px; padding: 18px; border-radius: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; }
        .info { margin-bottom: 12px; }
        .name { display: block; font-weight: 700; font-size: 17px; color: #1a1a1a; }
        .phone { font-size: 13px; color: #666; font-weight: 500; }
        .actions-v2 { display: flex; gap: 10px; height: 55px; }
        .qty-dropdown { flex: 1.2; padding: 0 10px; border-radius: 12px; border: 2px solid #e0e0e0; font-size: 14px; font-weight: 600; background: #fafafa; outline: none; }
        .big-save-btn { flex: 2; background: #1a237e; color: white; border: none; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: background 0.3s; }
        .big-save-btn.is-naga { background: #d32f2f; }
        .btn-label { font-size: 14px; font-weight: 800; }
        .btn-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
      `}</style>
    </div>
  );
}

export default MilkEntry;