import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  // LocalStorage se pehle se save kiya hua naam uthao agar hai toh
  const [name, setName] = useState(() => localStorage.getItem("savedLoginName") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError(lang === "en" ? "Please enter your name." : "कृपया अपना नाम दर्ज करें");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/login`, { name: name.trim() });
      const role = res.data.role;

      // User ki details save kar rahe hain session ke liye
      const user = { name: name.trim(), role: role };
      localStorage.setItem("user", JSON.stringify(user));
      
      // ISSE SUGGESTION AAYEGA: Browser ko yaad dilane ke liye alag se name save kar rahe hain
      localStorage.setItem("savedLoginName", name.trim());

      setTimeout(() => {
        if (role === "owner") navigate("/owner");
        else if (role === "customer") navigate("/customer");
        else setError("Role not recognized.");
      }, 1200);

    } catch (err) {
      setError(lang === "en" ? "User not found or server error." : "यूज़र नहीं मिला या सर्वर एरर।");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .lang-toggle{ position:absolute; top:60px; right:20px; z-index:20; }
        .lang-toggle button{ background:#0056b3; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
        .login-container { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f4f7f9; overflow: hidden; position: relative; font-family: 'Segoe UI', Roboto, sans-serif; }
        .top-banner { position: absolute; top: 0; width: 100%; background: #1a1a1a; color: #ffffff; text-align: center; padding: 15px 0; font-size: 1.2rem; font-weight: 900; letter-spacing: 3px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 10; text-transform: uppercase; }
        .wave-wrapper { position: absolute; bottom: 0; width: 100%; height: 120px; background: #fff; z-index: 0; }
        .wave { position: absolute; top: -80px; left: -50%; width: 200%; height: 200%; background: rgba(255, 255, 255, 0.7); border-radius: 43%; animation: drift 6s infinite linear; }
        @keyframes drift { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .login-card { background: white; padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); width: 90%; max-width: 360px; text-align: center; z-index: 5; border-top: 5px solid #0056b3; }
        .milk-drop { font-size: 45px; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .brand-title { color: #1a1a1a; font-size: 26px; margin: 10px 0 0; font-weight: 800; }
        .brand-subtitle { color: #888; font-size: 13px; margin-bottom: 25px; }
        .input-box { text-align: left; margin-bottom: 15px; }
        .input-box label { font-size: 12px; font-weight: bold; color: #444; display: block; margin-bottom: 5px; }
        .input-box input { width: 100%; padding: 12px; border-radius: 10px; border: 1.5px solid #ddd; font-size: 16px; outline: none; box-sizing: border-box; }
        .login-btn { width: 100%; padding: 14px; background: #0056b3; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; margin-top: 10px; cursor: pointer; transition: 0.3s; }
        .error-popup { color: #d9534f; font-size: 13px; margin-top: 15px; padding: 8px; background: #fceeee; border-radius: 5px; }
        .footer-text { font-size: 10px; color: #bbb; margin-top: 20px; text-transform: uppercase; }
      `}</style>

      <div className="lang-toggle">
        <button onClick={() => setLang(lang === "en" ? "hi" : "en")}>
          {lang === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      <div className="top-banner">PURITY PRODUCT </div>

      <div className="wave-wrapper"><div className="wave"></div></div>

      <div className="login-card">
        <div className="logo-section">
          <div className="milk-drop">🥛</div>
          <h1 className="brand-title">PURITY</h1>
          <p className="brand-subtitle">100% Pure Production</p>
        </div>

        {/* Browser ko hint dene ke liye autocomplete="on" rakha hai */}
        <form onSubmit={handleLogin} className="login-form" autoComplete="on">
          <div className="input-box">
            <label>
              {lang === "en" ? "Enter Your Name" : "अपना नाम डालें"}
            </label>
            <input
              type="text"
              name="username" // Name attribute browser suggestion ke liye zaroori hai
              autoComplete="username" // Browser ko batata hai ki ye username field hai
              placeholder={lang === "en" ? "Rahul" : "राहुल"}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading
              ? lang === "en" ? "Please wait..." : "थोड़ा इंतज़ार करें..."
              : lang === "en" ? "Login Dashboard" : "डैशबोर्ड लॉगिन"}
          </button>
        </form>

        {error && <div className="error-popup">{error}</div>}
        <p className="footer-text">© 2026 Purity Dairy Systems</p>
      </div>
    </div>
  );
}

export default Login;