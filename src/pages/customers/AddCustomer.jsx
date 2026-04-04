import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddCustomer() {
  const navigate = useNavigate();
  const [isHindi, setIsHindi] = useState(true);
  const [customers, setCustomers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  const t = (en, hi) => (isHindi ? hi : en);

  // FETCH LIST (Fixed for your Controller Structure)
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/customers`);
      // Aapka backend data ko "res.data.data" mein bhej raha hai
      if (res.data && Array.isArray(res.data.data)) {
        setCustomers(res.data.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setCustomers([]); 
    }
  }, [API]);

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
      // Local date formatting for PostgreSQL joining_date
      const today = new Date().toISOString().split("T")[0];

      await axios.post(`${API}/api/add-customer`, {
        ...formData,
        joining_date: today
      });
      
      setMessage({ text: t("Saved Successfully ✅", "सफलतापूर्वक सेव किया गया ✅"), type: "success" });
      setFormData({ name: "", mobile: "", address: "" });
      
      // Auto Refresh List
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
            <h1>{t("Purity Registry", "प्योरिटी रजिस्ट्रेशन")}</h1>
            <span className="status-pill">{t("Live Database", "लाइव डेटाबेस")}</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <input 
              type="text" 
              placeholder={t("Search...", "खोजें...")} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="lang-switch" onClick={() => setIsHindi(!isHindi)}>
            {isHindi ? "EN" : "HI"}
          </button>
        </div>
      </header>

      <main className="main-grid">
        {/* LEFT: ADD FORM */}
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
              {loading ? "..." : t("Save Customer", "ग्राहक सेव करें")}
            </button>
            
            {message.text && <div className={`status-msg ${message.type}`}>{message.text}</div>}
          </form>
        </div>

        {/* RIGHT: LIST */}
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
                          <span className="u-name">{c.name}</span>
                          <span className="u-phone">📞 {c.mobile}</span>
                          <span className="u-addr">📍 {c.address || "No Address"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-tag">
                          {c.joining_date ? new Date(c.joining_date).toLocaleDateString() : "—"}
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
        .glass-header { background: #1a237e; color: white; padding: 15px 25px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .back-circle { background: rgba(255,255,255,0.1); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
        .brand-info h1 { font-size: 18px; margin: 0; }
        .status-pill { font-size: 10px; background: #4caf50; padding: 2px 8px; border-radius: 10px; }
        .search-box input { padding: 8px 15px; border-radius: 8px; border: none; outline: none; width: 180px; }
        .lang-switch { background: white; color: #1a237e; border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
        
        .main-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        .form-card, .list-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        
        .field { margin-bottom: 15px; }
        .field label { display: block; font-size: 12px; font-weight: bold; color: #555; margin-bottom: 5px; }
        .field input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        
        .primary-btn { width: 100%; background: #1a237e; color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: bold; }
        
        .table-container { max-height: 500px; overflow-y: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; background: #f8f9fa; padding: 12px; font-size: 12px; color: #666; }
        td { padding: 15px 12px; border-bottom: 1px solid #f1f1f1; }
        
        .user-info .u-name { display: block; font-weight: bold; color: #333; font-size: 15px; }
        .user-info .u-phone { font-size: 12px; color: #1a237e; display: block; margin: 2px 0; }
        .user-info .u-addr { font-size: 11px; color: #777; }
        
        .date-tag { background: #e8eaf6; color: #1a237e; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        
        .icon-del { background: #fff0f0; border: none; color: #d32f2f; padding: 8px; border-radius: 6px; cursor: pointer; }
        .status-msg { margin-top: 15px; padding: 10px; border-radius: 8px; text-align: center; font-size: 12px; }
        .success { background: #e8f5e9; color: #2e7d32; }
        .error { background: #ffebee; color: #c62828; }
        .no-data { text-align: center; padding: 40px; color: #aaa; }

        @media (max-width: 850px) { .main-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default AddCustomer;