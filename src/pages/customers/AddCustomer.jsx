import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddCustomer() {
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [translatedData, setTranslatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false); // सर्च बॉक्स के लिए
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  const t = (en, hi) => (isHindi ? hi : en);

  // सर्च बार ओपन करने का फंक्शन
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/customers`);
      if (res.data && Array.isArray(res.data.data)) {
        const rawData = res.data.data;
        setCustomers(rawData);

        if (isHindi && rawData.length > 0) {
          const textsToTranslate = [];
          rawData.forEach((c) => {
            if (c.name) textsToTranslate.push(c.name);
            if (c.address) textsToTranslate.push(c.address);
          });

          const uniqueTexts = [...new Set(textsToTranslate)];

          try {
            const transRes = await axios.post(`${API}/api/translate-list`, {
              texts: uniqueTexts,
              targetLang: "hi",
            });
            setTranslatedData(transRes.data);
          } catch (transErr) {
            console.error("Translation API Error:", transErr);
          }
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setCustomers([]);
    }
  }, [API, isHindi]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await axios.post(`${API}/api/add-customer`, {
        ...formData,
        joining_date: today
      });

      setMessage({ text: t("Saved Successfully ✅", "सफलतापूर्वक जुड़ गया है ✅"), type: "success" });
      setFormData({ name: "", mobile: "", address: "" });
      fetchCustomers();
    } catch (err) {
      setMessage({ text: t("Error saving data ❌", "डेटा सेव करने में त्रुटि ❌"), type: "error" });
    }
    setLoading(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const deleteCustomer = async (id) => {
    if (window.confirm(t("Delete this customer?", "क्या आप इस ग्राहक को हटाना चाहते हैं?"))) {
      try {
        await axios.delete(`${API}/api/delete-customer/${id}`);
        fetchCustomers();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const filteredCustomers = (customers || []).filter(c =>
    c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c?.mobile?.includes(searchTerm)
  );

  return (
    <div className="admin-wrapper">
      <header className="glass-header">
        <div className="header-left">
          <button className="back-circle" onClick={() => navigate("/owner")}>‹</button>
          <div className="brand-info">
            <h1>{t("Add New Customer", "नया ग्राहक जोड़ें")}</h1>
            <span className="status-pill">{t("Live", "लाइव")}</span>
          </div>
        </div>

        <div className="header-right">
          <div className={`search-container ${isSearchOpen ? "open" : ""}`}>
            <button className="search-trigger" onClick={toggleSearch}>🔍</button>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder={t("Search...", "खोजें...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="lang-switch" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "English" : "हिंदी"}
          </button>
        </div>
      </header>

      <main className="main-grid">
        <div className="form-card">
          <div className="card-title">
            <span className="icon-bg">👤</span>
            <h3>{t("New Customer", "नया ग्राहक")}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{t("Full Name", "पूरा नाम")}</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="field">
              <label>{t("Mobile Number", "मोबाइल नंबर")}</label>
              <input type="number" name="mobile" value={formData.mobile} onChange={handleInputChange} required />
            </div>
            <div className="field">
              <label>{t("Address", "पता")}</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "..." : t("Save Customer", "ग्राहक जोड़ें")}
            </button>

            {message.text && <div className={`status-msg ${message.type}`}>{message.text}</div>}
          </form>
        </div>

        <div className="list-card">
          <div className="table-header">
            <h3>{t("Customer List", "ग्राहकों की सूची")} ({filteredCustomers.length})</h3>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t("Customer Details", "ग्राहक का विवरण")}</th>
                  <th>{t("Joined On", "जुड़ने की तिथि")}</th>
                  <th>{t("Actions", "कार्रवाई")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="user-info">
                          <span className="u-name">
                            {isHindi ? (translatedData[c.name] || c.name) : c.name}
                          </span>
                          <span className="u-phone">📞 {c.mobile}</span>
                          <span className="u-addr">
                            📍 {c.address 
                                ? (isHindi ? (translatedData[c.address] || c.address) : c.address) 
                                : t("No Address", "पता नहीं")}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="date-tag">
                          {c.joining_date ? new Date(c.joining_date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US') : "—"}
                        </span>
                      </td>
                      <td>
                        <button className="icon-del" onClick={() => deleteCustomer(c.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="no-data">{t("No Record Found", "कोई रिकॉर्ड नहीं मिला")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style>{`
        .admin-wrapper { min-height: 100vh; background: #f0f4f8; font-family: 'Segoe UI', sans-serif; padding: 20px; }
        .glass-header { background: #1a237e; color: white; padding: 12px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .back-circle { background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 18px; margin-right: 10px; }
        .header-left { display: flex; align-items: center; }
        .brand-info h1 { font-size: 16px; margin: 0; white-space: nowrap; }
        .status-pill { font-size: 9px; background: #4caf50; padding: 1px 6px; border-radius: 10px; margin-left: 8px; }
        
        /* SEARCH BAR LOGIC */
        .header-right { display: flex; align-items: center; gap: 15px; }
        .search-container { display: flex; align-items: center; background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px; transition: all 0.3s ease; width: 38px; overflow: hidden; }
        .search-container.open { width: 180px; background: white; }
        .search-trigger { background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px 8px; }
        .search-input { border: none; background: none; outline: none; padding: 4px 8px; width: 0; transition: width 0.3s; color: white; font-size: 13px; }
        .search-container.open .search-input { width: 130px; color: #333; }
        
        .lang-switch { background: white; color: #1a237e; border: none; padding: 6px 12px; border-radius: 18px; font-weight: bold; cursor: pointer; font-size: 12px; transition: 0.2s; }
        .lang-switch:hover { transform: scale(1.05); background: #f0f0f0; }

        .main-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        .form-card, .list-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .card-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .icon-bg { background: #e8eaf6; padding: 8px; border-radius: 10px; font-size: 18px; }

        .field { margin-bottom: 15px; }
        .field label { display: block; font-size: 11px; font-weight: bold; color: #666; margin-bottom: 4px; text-transform: uppercase; }
        .field input { width: 100%; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline-color: #1a237e; }
        
        .primary-btn { width: 100%; background: #1a237e; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; }
        
        .table-container { max-height: 450px; overflow-y: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; background: #f8f9fa; padding: 12px; font-size: 11px; color: #888; text-transform: uppercase; position: sticky; top: 0; }
        td { padding: 12px; border-bottom: 1px solid #f1f1f1; }
        
        .user-info .u-name { display: block; font-weight: bold; color: #333; font-size: 14px; }
        .user-info .u-phone { font-size: 12px; color: #1a237e; display: block; }
        .user-info .u-addr { font-size: 11px; color: #888; }
        
        .date-tag { background: #e8eaf6; color: #1a237e; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .icon-del { background: #fff0f0; border: none; color: #d32f2f; padding: 6px; border-radius: 6px; cursor: pointer; }

        @media (max-width: 850px) { 
          .main-grid { grid-template-columns: 1fr; } 
          .search-container.open { width: 140px; }
        }
      `}</style>
    </div>
  );
}

export default AddCustomer;