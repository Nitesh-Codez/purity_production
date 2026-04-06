import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CustomerCardsPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHindi, setIsHindi] = useState(true);
  const [translatedNames, setTranslatedNames] = useState({});
  
  const [detailModal, setDetailModal] = useState({ 
    show: false, 
    data: [], 
    customerName: "", 
    dailyLimit: 0,
    loading: false 
  });

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [price, setPrice] = useState("");

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";
  const t = (en, hi) => (isHindi ? hi : en);

  const months = [
    { v: 1, n: t("January", "जनवरी") }, { v: 2, n: t("February", "फरवरी") },
    { v: 3, n: t("March", "मार्च") }, { v: 4, n: t("April", "अप्रैल") },
    { v: 5, n: t("May", "मई") }, { v: 6, n: t("June", "जून") },
    { v: 7, n: t("July", "जुलाई") }, { v: 8, n: t("August", "अगस्त") },
    { v: 9, n: t("September", "सितंबर") }, { v: 10, n: t("October", "अक्टूबर") },
    { v: 11, n: t("November", "नवंबर") }, { v: 12, n: t("December", "दिसंबर") }
  ];

  const formatMilk = (qty) => {
    const num = parseFloat(qty);
    if (isNaN(num) || num === 0) return "0";
    
    const kg = Math.floor(num);
    const grams = Math.round((num - kg) * 1000);
    
    let res = "";
    if (kg > 0) res += `${kg}${t("kg", "kg")} `;
    
    if (grams === 750) {
      res += t("500g 250g", "500g 250g");
    } else if (grams > 0) {
      res += `${grams}${t("g", "g")}`;
    }
    
    return res.trim();
  };

  const fetchMonthlyBill = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/monthly-bill`, {
        params: { month, year, price_per_kg: price || 0 }
      });
      const data = res.data.data || [];
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
  }, [API, month, year, price]);

  useEffect(() => { 
    fetchMonthlyBill(); 
  }, [month, year, price, fetchMonthlyBill]);

  const handleViewDetails = async (customer) => {
    setDetailModal({ 
        show: true, 
        data: [], 
        customerName: customer.name, 
        dailyLimit: parseFloat(customer.daily_milk || 0), 
        loading: true 
    });

    try {
      const res = await axios.get(`${API}/api/monthly-entries`, { params: { month, year, name: customer.name } });
      let rawEntries = res.data.data || [];
      
      const groupedData = rawEntries.reduce((acc, current) => {
        const dateKey = new Date(current.delivery_date).toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = { ...current, milk_quantity: parseFloat(current.milk_quantity) };
        } else {
          acc[dateKey].milk_quantity += parseFloat(current.milk_quantity);
        }
        return acc;
      }, {});

      setDetailModal(prev => ({ 
        ...prev, 
        data: Object.values(groupedData).sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date)), 
        loading: false 
      }));
    } catch (err) {
      setDetailModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="report-wrapper">
      
      {detailModal.show && (
        <div className="modal-overlay" onClick={() => setDetailModal({...detailModal, show: false})}>
          <div className="detail-box" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
               <div className="handle-bar"></div>
               <h3>{isHindi ? (translatedNames[detailModal.customerName] || detailModal.customerName) : detailModal.customerName}</h3>
               <p className="limit-info">{t("Monthly Summary", "महीने का विवरण")}</p>
            </div>

            <div className="detail-list">
              {detailModal.loading ? (
                <div className="spin-container"><div className="purple-spinner"></div></div>
              ) : (
                detailModal.data.map((entry, idx) => {
                  const qty = parseFloat(entry.milk_quantity);
                  const isNaga = qty === 0;
                  const isLess = qty > 0 && qty < detailModal.dailyLimit;
                  
                  const dateStr = new Date(entry.delivery_date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-GB', {
                    weekday: 'short', day: '2-digit', month: 'short'
                  });

                  return (
                    <div key={idx} className={`entry-row ${isNaga ? 'naga-row' : ''}`}>
                       <div className="entry-date">{dateStr}</div>
                       <div className="entry-status">
                          {isNaga ? <span className="tag-naga">{t("HOLIDAY", "नागा")}</span> : 
                           isLess ? <span className="tag-less">{t("LESS", "कम")}</span> : 
                           <span className="tag-ok">{t("OK", "सही")}</span>}
                       </div>
                       <div className="entry-qty">
                          <b>{isNaga ? "-" : formatMilk(entry.milk_quantity)}</b>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="modal-footer">
                <button className="done-btn-orange" onClick={() => setDetailModal({...detailModal, show: false})}>
                    {t("Close", "बंद करें")}
                </button>
            </div>
          </div>
        </div>
      )}

      <header className="purple-header">
        <div className="nav-bar">
          <button className="round-btn" onClick={() => navigate(-1)}>‹</button>
          <h1 className="logo-text">PURITY</h1>
          <button className="lang-chip" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>

        <div className="filter-section">
          <select className="white-select" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
          <div className="white-input">
             <span className="curr-sym">₹</span>
             <input type="number" placeholder={t("Rate", "भाव")} value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading ? (
          <div className="spin-container"><div className="purple-spinner"></div></div>
        ) : (
          <div className="grid-system">
            {bills.map((b) => (
              <div className="clean-card" key={b.user_id} onClick={() => handleViewDetails(b)}>
                <div className="card-top">
                  <span className="user-name">{isHindi ? (translatedNames[b.name] || b.name) : b.name}</span>
                  <div className="h-count">{b.total_holidays || 0} {t("Off", "नागा")}</div>
                </div>
                
                <div className="card-stats">
                  <div className="stat">
                      <label>{t("Total Milk", "कुल दूध")}</label>
                      <div className="val">{formatMilk(b.total_milk)}</div>
                  </div>
                  <div className="stat">
                      <label>{t("Bill", "बिल")}</label>
                      <div className="val price-tag">₹{price > 0 ? b.total_money : "0"}</div>
                  </div>
                </div>
                <div className="bibaran-btn-orange">{t("View Details", "विवरण देखें")} ›</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap');
        
        .report-wrapper { background: #f8f9fc; min-height: 100vh; font-family: 'Outfit', sans-serif; }
        .purple-header { background: linear-gradient(135deg, #45069dd7 0%, #360d87 100%); padding: 30px 20px 50px; border-radius: 0 0 40px 40px; box-shadow: 0 10px 20px rgba(98, 0, 234, 0.15); }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: 1px; margin: 0; }
        .round-btn { width: 38px; height: 38px; border-radius: 12px; border: none; background: rgba(255,255,255,0.15); color: white; font-size: 24px; display: flex; align-items: center; justify-content: center; }
        .lang-chip { background: white; color: #230053; border: none; padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 11px; }

        .filter-section { display: flex; gap: 12px; }
        .white-select, .white-input { background: white; border: none; border-radius: 18px; padding: 14px; flex: 1; font-weight: 700; color: #4a00e0; outline: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .white-input { display: flex; align-items: center; }
        .white-input input { border: none; width: 100%; outline: none; font-weight: 700; color: #4a00e0; margin-left: 5px; font-size: 16px; }
        .curr-sym { font-weight: 900; color: #000000; }

        .main-content { padding: 20px; margin-top: -35px; }
        .grid-system { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .clean-card { background: white; border-radius: 25px; padding: 18px; border: 1px solid #edf2f7; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: 0.2s; }
        .clean-card:active { transform: scale(0.96); }
        
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .user-name { font-weight: 800; font-size: 18px; color: #1a202c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; }
        .h-count { font-size: 9px; font-weight: 800; background: #fff5f5; color: #e53e3e; padding: 4px 8px; border-radius: 8px; }
        
        .card-stats { display: flex; flex-direction: column; gap: 8px; }
        .stat label { font-size: 10px; color: #718096; font-weight: 700; text-transform: uppercase; }
        .stat .val { font-size: 13px; font-weight: 700; color: #2d3748; }
        .price-tag { color: #1b0040 !important; font-size: 15px !important; font-weight: 900 !important; }

        .bibaran-btn-orange { margin-top: 15px; font-size: 11px; font-weight: 800; color: white; background: #ff8c00; padding: 8px; border-radius: 12px; text-align: center; box-shadow: 0 4px 10px rgba(255, 140, 0, 0.2); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: flex-end; }
        .detail-box { background: white; width: 100%; border-radius: 35px 35px 0 0; height: 80vh; display: flex; flex-direction: column; animation: slideUp 0.4s ease; }
        .detail-header { padding: 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .handle-bar { width: 40px; height: 5px; background: #e2e8f0; border-radius: 10px; margin: 0 auto 15px; }
        .detail-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #4a00e0; }
        .limit-info { font-size: 12px; color: #718096; margin-top: 4px; }

        .detail-list { flex: 1; overflow-y: auto; padding: 0 20px; }
        .entry-row { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f7fafc; }
        .entry-date { flex: 1.5; font-size: 13px; font-weight: 600; color: #4a5568; }
        .entry-status { flex: 1; text-align: center; }
        .entry-qty { flex: 1.2; text-align: right; font-size: 14px; }

        .tag-naga { color: #e53e3e; font-size: 10px; font-weight: 800; background: #fff5f5; padding: 4px 10px; border-radius: 10px; }
        .tag-less { color: #d69e2e; font-size: 10px; font-weight: 800; background: #fffff0; padding: 4px 10px; border-radius: 10px; }
        .tag-ok { color: #38a169; font-size: 10px; font-weight: 800; background: #f0fff4; padding: 4px 10px; border-radius: 10px; }

        .modal-footer { padding: 20px; }
        .done-btn-orange { width: 100%; padding: 16px; background: #ff8c00; color: white; border: none; border-radius: 18px; font-weight: 800; font-size: 15px; }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .spin-container { display: flex; justify-content: center; padding: 50px; }
        .purple-spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #6200ea; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default CustomerCardsPage;