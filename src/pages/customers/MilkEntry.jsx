import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MilkEntry() {
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null); // null means shift selection screen
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

  // Robust Android-Compatible Speech Function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Clear any stuck queues
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity

      // Attempt to pick an explicit Hindi voice if available on Android
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetVoice = voices.find(v => 
          isHindi ? (v.lang.includes('hi') || v.lang.includes('IN')) : v.lang.includes('en')
        );
        if (targetVoice) {
          utterance.voice = targetVoice;
        }
      }

      // CRITICAL: Prevent garbage collection on Android mobile browsers
      window._speechUtteranceRef = utterance;

      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/customers`);
      const allData = res.data.data;
      
      // Filter out inactive customers (is_active === false)
      const data = allData.filter(c => c.is_active !== false);
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
    // Preload voices for Android webviews
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
  }, [fetchData]);

  const saveMilk = async (id) => {
    const qty = milk[id];
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

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
      const day = parseInt(dateParts[2], 10);
      const month = hindiMonths[parseInt(dateParts[1], 10) - 1];
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

  // Filter active customers by selected shift
  const filteredCustomers = customers.filter(c => {
    if (!selectedShift) return true;
    const shiftVal = (c.shift || "Morning").toLowerCase();
    if (selectedShift === "Morning") {
      return shiftVal.includes("morning") || shiftVal.includes("सुबह");
    } else {
      return shiftVal.includes("night") || shiftVal.includes("evening") || shiftVal.includes("शाम") || shiftVal.includes("रात");
    }
  });

  const morningCount = customers.filter(c => {
    const s = (c.shift || "Morning").toLowerCase();
    return s.includes("morning") || s.includes("सुबह");
  }).length;

  const nightCount = customers.length - morningCount;

  return (
    <div className="entry-wrapper">
      <header className="entry-header">
        <div className="header-top">
          <button 
            className="back-btn" 
            onClick={() => {
              if (selectedShift) {
                setSelectedShift(null);
              } else {
                navigate(-1);
              }
            }}
          >
            ‹
          </button>
          <h1>
            {selectedShift 
              ? `${selectedShift === "Morning" ? t("Morning Shift", "सुबह की शिफ्ट") : t("Night Shift", "शाम की शिफ्ट")}` 
              : t("Milk Entry", "दूध चढ़ाएं")}
          </h1>
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

        {/* STEP 1: Shift Selection Screen */}
        {!selectedShift ? (
          <div className="shift-selection-container">
            <h2 className="shift-heading">{t("Select Delivery Shift", "वितरण शिफ्ट चुनें")}</h2>
            
            <div className="shift-cards-grid">
              <div className="shift-card-option morning-card" onClick={() => setSelectedShift("Morning")}>
                <div className="shift-icon">🌅</div>
                <div className="shift-info">
                  <h3>{t("Morning Shift", "सुबह की शिफ्ट")}</h3>
                  <p>{morningCount} {t("Customers", "ग्राहक")}</p>
                </div>
                <div className="shift-arrow">›</div>
              </div>

              <div className="shift-card-option night-card" onClick={() => setSelectedShift("Night")}>
                <div className="shift-icon">🌙</div>
                <div className="shift-info">
                  <h3>{t("Night / Evening Shift", "शाम / रात की शिफ्ट")}</h3>
                  <p>{nightCount} {t("Customers", "ग्राहक")}</p>
                </div>
                <div className="shift-arrow">›</div>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: Customer List for Selected Shift */
          <>
            <div className="shift-indicator-bar">
              <span>{selectedShift === "Morning" ? "🌅 " + t("Morning Shift", "सुबह की शिफ्ट") : "🌙 " + t("Night Shift", "शाम की शिफ्ट")}</span>
              <button className="change-shift-link" onClick={() => setSelectedShift(null)}>
                {t("Change Shift", "शिफ्ट बदलें")}
              </button>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="no-customers">{t("No active customers found in this shift.", "इस शिफ्ट में कोई सक्रिय ग्राहक नहीं मिला।")}</div>
            ) : (
              filteredCustomers.map((c) => {
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
              })
            )}
          </>
        )}
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
        
        /* Shift Selection UI */
        .shift-selection-container { margin-top: 30px; text-align: center; }
        .shift-heading { font-size: 18px; color: #333; margin-bottom: 20px; font-weight: 700; }
        .shift-cards-grid { display: flex; flex-direction: column; gap: 15px; max-width: 500px; margin: 0 auto; }
        .shift-card-option { background: white; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 2px solid #e0e0e0; transition: all 0.2s; text-align: left; }
        .shift-card-option:active { transform: scale(0.98); }
        .morning-card { border-color: #ffb74d; background: linear-gradient(to right, #fff8e1, #ffffff); }
        .night-card { border-color: #7986cb; background: linear-gradient(to right, #e8eaf6, #ffffff); }
        .shift-icon { font-size: 32px; background: rgba(0,0,0,0.04); padding: 10px; border-radius: 12px; }
        .shift-info { flex: 1; }
        .shift-info h3 { margin: 0 0 4px 0; font-size: 16px; color: #1a1a1a; font-weight: 700; }
        .shift-info p { margin: 0; font-size: 13px; color: #666; font-weight: 500; }
        .shift-arrow { font-size: 24px; color: #888; font-weight: bold; }

        .shift-indicator-bar { background: #e8eaf6; padding: 10px 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: 600; color: #1a237e; font-size: 14px; }
        .change-shift-link { background: #1a237e; color: white; border: none; padding: 5px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: bold; }

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
        .no-customers { text-align: center; padding: 40px; color: #666; font-size: 14px; font-weight: 500; }
      `}</style>
    </div>
  );
}

export default MilkEntry;