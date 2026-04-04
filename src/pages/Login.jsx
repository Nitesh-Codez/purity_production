import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Purity Production - Login Component
 * Design: Minimalist Dairy Theme (Blue & White)
 */

function Login() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to continue.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/login`, { name: name.trim() });
      const role = res.data.role;

      // Success animation delay (optional)
      setTimeout(() => {
        if (role === "owner") {
          navigate("/owner");
        } else if (role === "customer") {
          navigate("/customer");
        } else {
          setError("Role not recognized. Contact admin.");
        }
      }, 800);

    } catch (err) {
      console.error(err);
      setError("User not found or server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Styles Object (Standard CSS-in-JS)
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f4f8",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "15px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center",
    },
    logoArea: {
      marginBottom: "20px",
    },
    brandName: {
      color: "#0056b3",
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0",
      letterSpacing: "1px",
    },
    brandTagline: {
      color: "#6c757d",
      fontSize: "14px",
      marginBottom: "30px",
    },
    inputGroup: {
      marginBottom: "20px",
      textAlign: "left",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      color: "#495057",
      fontWeight: "600",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      borderRadius: "8px",
      border: "2px solid #e9ecef",
      fontSize: "16px",
      boxSizing: "border-box",
      transition: "border-color 0.3s",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: isLoading ? "#a0c4ff" : "#0056b3",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: isLoading ? "not-allowed" : "pointer",
      transition: "background 0.3s ease",
    },
    errorMsg: {
      color: "#dc3545",
      fontSize: "13px",
      marginTop: "10px",
      backgroundColor: "#f8d7da",
      padding: "8px",
      borderRadius: "5px",
    },
    footer: {
      marginTop: "25px",
      fontSize: "12px",
      color: "#adb5bd",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          {/* Milk Drop Icon Placeholder */}
          <div style={{fontSize: "40px", marginBottom: "10px"}}>🥛</div>
          <h1 style={styles.brandName}>PURITY PRODUCTION</h1>
          <p style={styles.brandTagline}>Freshness you can trust</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Apna Name daaliye bina space k</label>
            <input
              type="text"
              placeholder="Rahul"
              style={styles.input}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if(error) setError("");
              }}
              onFocus={(e) => e.target.style.borderColor = "#0056b3"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <div style={styles.footer}>
          &copy; 2024 Purity Production Systems
        </div>
      </div>
    </div>
  );
}

export default Login;