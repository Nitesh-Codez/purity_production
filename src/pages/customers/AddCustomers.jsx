import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddCustomers() {
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [translatedData, setTranslatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const searchInputRef = useRef(null);

  const milkOptions = [
    { label: "250g", value: 0.25 },
    { label: "500g", value: 0.50 },
    { label: "750g", value: 0.75 },
    { label: "1kg", value: 1.00 },
    { label: "1kg 250g", value: 1.25 },
    { label: "1kg 500g", value: 1.50 },
    { label: "2kg", value: 2.00 },
    { label: "2kg 500g", value: 2.50 },
    { label: "3kg", value: 3.00 },
  ];

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    daily_milk: 0.50,
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

  const resetForm = () => {
    setFormData({ name: "", mobile: "", daily_milk: 0.50, address: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const startEdit = (c) => {
    setIsEditing(true);
    setEditId(c.id);
    setFormData({
      name: c.name,
      mobile: c.mobile,
      daily_milk: c.daily_milk,
      address: c.address || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;

    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`${API}/api/update-customer/${editId}`, formData);
        setMessage({ text: t("Updated Successfully ✅", "सफलतापूर्वक सुधार दिया गया ✅"), type: "success" });
      } else {
        const today = new Date().toISOString().split("T")[0];
        await axios.post(`${API}/api/add-customer`, {
          ...formData,
          joining_date: today
        });
        setMessage({ text: t("Saved Successfully ✅", "सफलतापूर्वक जुड़ गया है ✅"), type: "success" });
      }
      resetForm();
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
      {/* --- NEW IMPROVED HEADER --- */}
      <header className="glass-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-circle" onClick={() => navigate("/owner")}>‹</button>
            <div className="title-section">
              <h1>{isEditing ? t("Edit Customer", "ग्राहक सुधारें") : t("Add New Customer", "नया ग्राहक जोड़ें")}</h1>
              <span className="status-pill">{t("Live", "लाइव")}</span>
            </div>
          </div>

          <div className="header-right">
            <div className={`search-box ${isSearchOpen ? "active" : ""}`}>
              <button className="search-btn" onClick={toggleSearch}>🔍</button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("Search...", "खोजें...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="lang-toggle" onClick={() => setIsHindi(!isHindi)}>
              {isHindi ? "English" : "हिंदी"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-grid">
        {/* --- FORM SECTION --- */}
        <div className="form-card">
          <div className="card-header">
            <div className="icon-box">{isEditing ? "✏️" : "👤"}</div>
            <h3>{isEditing ? t("Update Information", "जानकारी सुधारें") : t("Customer Details", "ग्राहक विवरण")}</h3>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="field">
              <label>{t("Full Name", "पूरा नाम")}</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="field">
              <label>{t("Mobile Number", "मोबाइल नंबर")}</label>
              <input type="number" name="mobile" value={formData.mobile} onChange={handleInputChange} required />
            </div>
            <div className="field">
              <label>{t("Daily Milk Quantity", "रोज़ाना दूध की मात्रा")}</label>
              <select name="daily_milk" value={formData.daily_milk} onChange={handleInputChange} className="custom-select">
                {milkOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Address", "पता")}</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="btn-group">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "..." : isEditing ? t("Update Customer", "अपडेट करें") : t("Save Customer", "ग्राहक जोड़ें")}
              </button>
              {isEditing && (
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  {t("Cancel", "रद्द करें")}
                </button>
              )}
            </div>

            {message.text && <div className={`status-msg ${message.type}`}>{message.text}</div>}
          </form>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="list-card">
          <div className="list-header">
            <h3>{t("All Customers", "सभी ग्राहकों की सूची")} <span className="count-badge">{filteredCustomers.length}</span></h3>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{t("Customer Details", "ग्राहक का विवरण")}</th>
                  <th>{t("Milk", "दूध")}</th>
                  <th>{t("Joined On", "जुड़ने की तिथि")}</th>
                  <th style={{ textAlign: "right" }}>{t("Actions", "कार्रवाई")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-info">
                        <span className="c-name">{isHindi ? (translatedData[c.name] || c.name) : c.name}</span>
                        <span className="c-phone">📞 {c.mobile}</span>
                        <span className="c-addr">{c.address ? (isHindi ? (translatedData[c.address] || c.address) : c.address) : "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="milk-badge">
                        {milkOptions.find(o => parseFloat(o.value) === parseFloat(c.daily_milk))?.label || c.daily_milk + "kg"}
                      </span>
                    </td>
                    <td>
                      <span className="date-badge">
                        {c.joining_date ? new Date(c.joining_date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { day: '2-digit', month: 'short' }) : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="edit-btn" onClick={() => startEdit(c)}>✏️</button>
                        <button className="delete-btn" onClick={() => deleteCustomer(c.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style>{`
        /* CSS RESET & VARIABLES */
        :root { --primary: #1a237e; --accent: #4caf50; --bg: #f0f4f8; --white: #ffffff; }

        .admin-wrapper { min-height: 100vh; background: var(--bg); padding: 20px; font-family: 'Inter', system-ui, sans-serif; }

        /* HEADER STYLING */
        .glass-header { background: var(--primary); color: var(--white); border-radius: 16px; padding: 15px 25px; margin-bottom: 25px; box-shadow: 0 10px 20px rgba(26,35,126,0.2); }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        
        .header-left { display: flex; align-items: center; gap: 15px; }
        .back-circle { width: 35px; height: 35px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; color: white; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }
        
        .title-section { display: flex; align-items: center; gap: 10px; }
        .title-section h1 { font-size: 18px; margin: 0; font-weight: 600; }
        .status-pill { font-size: 10px; background: var(--accent); padding: 2px 8px; border-radius: 20px; }

        .header-right { display: flex; align-items: center; gap: 15px; }
        .search-box { display: flex; align-items: center; background: rgba(255,255,255,0.1); border-radius: 25px; padding: 2px 10px; transition: 0.3s; width: 40px; overflow: hidden; }
        .search-box.active { width: 200px; background: white; }
        .search-box input { border: none; background: none; outline: none; padding: 8px; width: 0; transition: 0.3s; }
        .search-box.active input { width: 150px; color: #333; }
        .search-btn { background: none; border: none; cursor: pointer; font-size: 16px; }

        .lang-toggle { background: white; color: var(--primary); border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 12px; }

        /* GRID LOGIC */
        .main-grid { display: grid; grid-template-columns: 350px 1fr; gap: 25px; align-items: start; }

        /* CARD STYLING */
        .form-card, .list-card { background: var(--white); border-radius: 20px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .card-header, .list-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
        .icon-box { background: #e8eaf6; padding: 10px; border-radius: 12px; font-size: 20px; }
        .count-badge { background: #e8eaf6; color: var(--primary); padding: 2px 10px; border-radius: 10px; font-size: 12px; }

        /* FORM STYLING */
        .field { margin-bottom: 18px; }
        .field label { display: block; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; margin-bottom: 6px; }
        .field input, .custom-select { width: 100%; padding: 12px; border: 1px solid #edf2f7; border-radius: 10px; background: #f8fafc; outline-color: var(--primary); font-size: 14px; }
        
        .btn-group { display: flex; gap: 10px; margin-top: 25px; }
        .save-btn { flex: 2; background: var(--primary); color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .cancel-btn { flex: 1; background: #f1f1f1; color: #666; border: none; padding: 14px; border-radius: 10px; cursor: pointer; }

        /* TABLE STYLING */
        .table-responsive { overflow-x: auto; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { text-align: left; background: #f8fafc; padding: 15px; font-size: 11px; color: #a0aec0; text-transform: uppercase; }
        td { padding: 15px; border-bottom: 1px solid #f1f5f9; }

        .customer-info .c-name { display: block; font-weight: 600; color: #2d3748; font-size: 15px; }
        .customer-info .c-phone { font-size: 12px; color: var(--primary); font-weight: 500; }
        .customer-info .c-addr { font-size: 11px; color: #718096; display: block; margin-top: 2px; }

        .milk-badge { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .date-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

        .action-btns { display: flex; gap: 8px; justify-content: flex-end; }
        .edit-btn { background: #f0fdf4; color: #16a34a; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }
        .delete-btn { background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }

        /* RESPONSIVE */
        @media (max-width: 1000px) {
          .main-grid { grid-template-columns: 1fr; }
          .glass-header { padding: 12px 15px; }
          .search-box.active { width: 140px; }
        }
      `}</style>
    </div>
  );
}

export default AddCustomers;