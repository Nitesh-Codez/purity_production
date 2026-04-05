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

  // डेटा फेच और ट्रांसलिटरेशन लॉजिक
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/customers`);
      const data = res.data.data;
      setCustomers(data);
      
      const defaults = {};
      const namesToTranslate = [];

      data.forEach(c => {
        defaults[c.id] = c.daily_milk || 0.50; 
        if (c.name) namesToTranslate.push(c.name);
      });
      setMilk(defaults);

      // --- LIVE TRANSLITERATION CALL ---
      if (isHindi && namesToTranslate.length > 0) {
        try {
          const transRes = await axios.post(`${API}/api/translate-list`, {
            texts: [...new Set(namesToTranslate)]
          });
          setTranslatedData(transRes.data);
        } catch (err) {
          console.error("Transliteration error", err);
        }
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
  }, [API, isHindi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // दूध चढ़ाने वाला फंक्शन
  const saveMilk = async (id) => {
    const qty = milk[id];
    const customer = customers.find(c => c.id === id);
    const selectedLabel = milkOptions.find(o => parseFloat(o.value) === parseFloat(qty))?.label;
    
    try {
      await axios.post(`${API}/api/save-entry`, {
  user_id: id,
  milk_quantity: qty,
  delivery_date: selectedDate
});
      
      setMessage({ 
        text: `${isHindi ? (translatedData[customer.name] || customer.name) : customer.name}: ${qty === 0 ? t("Holiday Set", "नागा लग गया") : selectedLabel + " " + t("Saved", "चढ़ गया")}`, 
        type: "success" 
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 2500);
    } catch (err) {
      alert("Error saving data");
    }
  };

  return (
    <div className="entry-wrapper">
      <header className="entry-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <h1>{t("Milk Entry", "दूध चढ़ाएं")}</h1>
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
          const currentQty = milk[c.id];
          const optionLabel = milkOptions.find(o => parseFloat(o.value) === parseFloat(currentQty))?.label || currentQty;

          return (
            <div key={c.id} className="entry-card">
              <div className="info">
                <span className="name">
                  {isHindi ? (translatedData[c.name] || c.name) : c.name}
                </span>
                <span className="phone">📞 {c.mobile}</span>
              </div>

              <div className="actions-v2">
                {/* मात्रा चुनने वाला ड्रॉपडाउन */}
                <select 
                  value={currentQty} 
                  onChange={(e) =>
  setMilk({ ...milk, [c.id]: parseFloat(e.target.value) })
}
                  className="qty-dropdown"
                >
                  {milkOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* बड़ा 'दूध चढ़ाएं' बटन जो चुनी हुई मात्रा दिखाता है */}
                <button 
                  className={`big-save-btn ${parseFloat(currentQty) === 0 ? 'is-naga' : ''}`}
                  onClick={() => saveMilk(c.id)}
                >
                  <span className="btn-label">{optionLabel}</span>
                  <span className="btn-sub">{t("Tap to Save", "चढ़ाए")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </main>

      <style>{`
        .entry-wrapper { background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; padding-bottom: 40px; }
        
        .entry-header { background: #1a237e; color: white; padding: 15px 20px; border-radius: 0 0 25px 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .header-top h1 { font-size: 20px; margin: 0; font-weight: 600; }
        
        .back-btn { background: rgba(255,255,255,0.1); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .lang-btn { background: white; color: #1a237e; border: none; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        
        .date-selector { background: rgba(255,255,255,0.15); padding: 8px 15px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .date-selector label { font-size: 14px; font-weight: 500; }
        .date-selector input { border: none; padding: 6px 10px; border-radius: 8px; font-weight: bold; font-family: inherit; }

        .entry-list { padding: 15px; }
        .toast-msg { position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: #2e7d32; color: white; padding: 12px 25px; border-radius: 30px; z-index: 1000; box-shadow: 0 5px 15px rgba(0,0,0,0.2); font-weight: 500; min-width: 200px; text-align: center; }

        .entry-card { background: white; margin-bottom: 15px; padding: 18px; border-radius: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); border: 1px solid #eee; }
        .info { margin-bottom: 12px; }
        .name { display: block; font-weight: 700; font-size: 17px; color: #1a1a1a; margin-bottom: 2px; }
        .phone { font-size: 13px; color: #666; font-weight: 500; }

        /* NEW ACTIONS LAYOUT */
        .actions-v2 { display: flex; gap: 10px; height: 55px; }
        
        .qty-dropdown { flex: 1; padding: 0 10px; border-radius: 12px; border: 2px solid #e0e0e0; font-size: 14px; font-weight: 600; background: #fafafa; color: #333; outline: none; }
        .qty-dropdown:focus { border-color: #1a237e; }

        .big-save-btn { flex: 2; background: #1a237e; color: white; border: none; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .big-save-btn:active { transform: scale(0.96); }
        .big-save-btn.is-naga { background: #d32f2f; } /* नागा के लिए लाल रंग */

        .btn-label { font-size: 15px; font-weight: 800; }
        .btn-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }

        @media (max-width: 400px) {
          .name { font-size: 15px; }
          .btn-label { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}

export default MilkEntry;