import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const MilkList = () => {
  const now = new Date();
  const [isHindi, setIsHindi] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://purity-production-backend.onrender.com";

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : { id: 19, name: "Customer", role: "customer" };
    } catch (e) {
      return { id: 19, name: "Customer", role: "customer" };
    }
  });

  const userId = currentUser.id;

  const [milkList, setMilkList] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const t = (en, hi) => (isHindi ? hi : en);

  const months = [
    { v: 1, en: "January", hi: "जनवरी" },
    { v: 2, en: "February", hi: "फरवरी" },
    { v: 3, en: "March", hi: "मार्च" },
    { v: 4, en: "April", hi: "अप्रैल" },
    { v: 5, en: "May", hi: "मई" },
    { v: 6, en: "June", hi: "जून" },
    { v: 7, en: "July", hi: "जुलाई" },
    { v: 8, en: "August", hi: "अगस्त" },
    { v: 9, en: "September", hi: "सितंबर" },
    { v: 10, en: "October", hi: "अक्टूबर" },
    { v: 11, en: "November", hi: "नवंबर" },
    { v: 12, en: "December", hi: "दिसंबर" },
  ];

  const currentYear = now.getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  const selectedMonthObj = months.find((m) => m.v === selectedMonth);
  const selectedMonthName = selectedMonthObj ? (isHindi ? selectedMonthObj.hi : selectedMonthObj.en) : "";

  // Helper to convert numeric quantity (e.g. 0.50, 1.25) to readable format like "500g", "1kg 250g"
  const formatMilkQuantity = (qty) => {
    const val = parseFloat(qty || 0);
    const map = {
      0.25: "250g",
      0.50: "500g",
      0.75: "500g 250g",
      1.00: "1kg",
      1.25: "1kg 250g",
      1.50: "1kg 500g",
      2.00: "2kg",
      2.50: "2kg 500g",
      3.00: "3kg"
    };
    if (map[val]) return map[val];
    if (val >= 1) {
      const kg = Math.floor(val);
      const remainder = val - kg;
      if (remainder === 0.5) return `${kg}kg 500g`;
      if (remainder === 0.25) return `${kg}kg 250g`;
      return `${val}kg`;
    }
    return `${val * 1000}g`;
  };

  const fetchMonthlyMilk = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/monthly/${userId}`, {
      params: { month: selectedMonth, year: selectedYear },
    });
    if (response.data.success) {
      setMilkList(response.data.data || []);
    } else {
      setMilkList([]);
    }
  }, [API_BASE_URL, userId, selectedMonth, selectedYear]);

  const fetchMonthlyBill = useCallback(async () => {
    const response = await axios.get(`${API_BASE_URL}/api/bill/${userId}`, {
      params: { month: selectedMonth, year: selectedYear },
    });
    if (response.data.success) {
      setCustomer(response.data.customer || null);
      setBill(response.data.bill || null);
    } else {
      setCustomer(null);
      setBill(null);
    }
  }, [API_BASE_URL, userId, selectedMonth, selectedYear]);

  const fetchAllData = useCallback(
    async (showFullLoader = true) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError("");
        setMilkList([]);
        setCustomer(null);
        setBill(null);

        await Promise.all([fetchMonthlyMilk(), fetchMonthlyBill()]);
      } catch (err) {
        setError(t("Unable to load monthly record. Please try again.", "मासिक रिकॉर्ड लोड करने में असमर्थ। कृपया पुनः प्रयास करें।"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchMonthlyMilk, fetchMonthlyBill, isHindi]
  );

  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  const calculatedTotalMilk = milkList.reduce(
    (total, item) => total + parseFloat(item.milk_quantity || 0),
    0
  );

  const totalMilk =
    bill?.total_milk !== undefined && bill?.total_milk !== null
      ? Number(bill.total_milk)
      : calculatedTotalMilk;

  const totalBill = Number(bill?.total_bill || 0);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(isHindi ? "hi-IN" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayName = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(isHindi ? "hi-IN" : "en-US", { weekday: "short" });
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingCardStyle}>
          <div style={spinnerStyle}></div>
          <div style={loadingTextStyle}>{t("Loading records...", "रिकॉर्ड लोड हो रहा है...")}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header with Language Toggle Button */}
        <div style={headerStyle}>
          <div>
            <div style={badgeStyle}>{t("CUSTOMER PANEL", "ग्राहक पैनल")}</div>
            <h1 style={titleStyle}>{t("Milk Delivery", "दूध वितरण")}</h1>
            <p style={subtitleStyle}>
              {t("Welcome back,", "वापसी पर स्वागत है,")}{" "}
              <span style={highlightNameStyle}>
                {customer?.name || currentUser.name}
              </span>{" "}
              <span style={{ color: "#8c959f", fontSize: "12px" }}>(ID: {userId})</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="lang-toggle" onClick={() => setIsHindi(!isHindi)} style={langToggleStyle}>
              {isHindi ? "English" : "हिंदी"}
            </button>
            <div style={headerIconStyle}>🥛</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={cardStyle}>
          <div style={filterGridStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t("Month", "महीना")}</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={selectStyle}
              >
                {months.map((m) => (
                  <option key={m.v} value={m.v}>
                    {isHindi ? m.hi : m.en}
                  </option>
                ))}
              </select>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>{t("Year", "वर्ष")}</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={selectStyle}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchAllData(false)}
              disabled={refreshing}
              style={buttonStyle}
            >
              {refreshing ? t("Refreshing...", "रिफ़्रेश हो रहा है...") : t("Refresh Data", "डेटा रीफ्रेश करें")}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && <div style={errorStyle}>{error}</div>}

        {/* Summary Metrics */}
        <div style={metricsGridStyle}>
          <div style={metricCardStyle}>
            <div style={metricLabelStyle}>{t("Total Milk", "कुल दूध")}</div>
            <div style={metricValueStyle}>{formatMilkQuantity(totalMilk)}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={metricLabelStyle}>{t("Total Bill", "कुल बिल")}</div>
            <div style={metricValueStyle}>₹{totalBill.toFixed(2)}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={metricLabelStyle}>{t("Entries", "प्रविष्टियां")}</div>
            <div style={metricValueStyle}>{milkList.length}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={metricLabelStyle}>{t("Shift", "शिफ्ट")}</div>
            <div style={metricValueStyle}>{t(customer?.shift || "Morning", customer?.shift === "Evening" ? "शाम" : "सुबह")}</div>
          </div>
        </div>

        {/* Data Table */}
        <div style={cardStyle}>
          <div style={tableHeaderStyle}>
            <h3 style={tableTitleStyle}>
              {selectedMonthName} {selectedYear} {t("Records", "रिकॉर्ड")}
            </h3>
            <span style={countBadgeStyle}>{milkList.length} {t("entries", "प्रविष्टियां")}</span>
          </div>

          {milkList.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thRowStyle}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>{t("Date", "दिनांक")}</th>
                    <th style={thStyle}>{t("Day", "दिन")}</th>
                    <th style={thStyle}>{t("Quantity", "मात्रा")}</th>
                    <th style={thStyle}>{t("Status", "स्थिति")}</th>
                  </tr>
                </thead>
                <tbody>
                  {milkList.map((item, index) => (
                    <tr key={item.id || index} style={trStyle}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{formatDate(item.date || item.delivery_date)}</td>
                      <td style={tdStyle}>{getDayName(item.date || item.delivery_date)}</td>
                      <td style={tdStyle}>
                        <span style={milkBadgeStyle}>
                          {formatMilkQuantity(item.milk_quantity)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={statusStyle}>{t("Delivered", "वितरित")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStyle}>{t("No records found for this period.", "इस अवधि के लिए कोई रिकॉर्ड नहीं मिला।")}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f4f6f9",
  padding: "24px 16px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#333333",
  boxSizing: "border-box",
};

const containerStyle = { maxWidth: "960px", margin: "0 auto" };

const headerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  padding: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  border: "1px solid #e1e4e8",
};

const badgeStyle = {
  fontSize: "11px",
  letterSpacing: "0.5px",
  fontWeight: "600",
  color: "#57606a",
  marginBottom: "4px",
  textTransform: "uppercase",
};

const titleStyle = { margin: "0 0 6px 0", fontSize: "22px", fontWeight: "600", color: "#24292e" };
const subtitleStyle = { margin: 0, fontSize: "13px", color: "#57606a" };

const highlightNameStyle = {
  fontWeight: "600",
  color: "#0366d6",
  backgroundColor: "#f1f8ff",
  padding: "2px 6px",
  borderRadius: "4px",
  border: "1px solid #c8e1ff",
};

const headerIconStyle = { fontSize: "28px", backgroundColor: "#f1f8ff", padding: "12px", borderRadius: "8px" };
const langToggleStyle = { background: "#1a237e", color: "white", border: "none", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" };

const cardStyle = { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px", marginBottom: "20px", border: "1px solid #e1e4e8" };
const filterGridStyle = { display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" };
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "6px", flex: "1", minWidth: "160px" };
const labelStyle = { fontSize: "12px", fontWeight: "500", color: "#57606a" };
const selectStyle = { height: "38px", padding: "0 12px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", color: "#24292e", fontSize: "13px", outline: "none" };
const buttonStyle = { height: "38px", padding: "0 16px", borderRadius: "6px", border: "1px solid #1b1f2326", backgroundColor: "#2ea44f", color: "#ffffff", fontSize: "13px", fontWeight: "500", cursor: "pointer" };

const metricsGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" };
const metricCardStyle = { backgroundColor: "#ffffff", borderRadius: "10px", padding: "16px", border: "1px solid #e1e4e8" };
const metricLabelStyle = { fontSize: "12px", color: "#57606a", fontWeight: "500", marginBottom: "4px" };
const metricValueStyle = { fontSize: "18px", fontWeight: "600", color: "#24292e" };

const tableHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" };
const tableTitleStyle = { margin: 0, fontSize: "15px", fontWeight: "600", color: "#24292e" };
const countBadgeStyle = { fontSize: "12px", backgroundColor: "#f1f8ff", color: "#0366d6", padding: "2px 8px", borderRadius: "12px", fontWeight: "500" };

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" };
const thRowStyle = { borderBottom: "1px solid #e1e4e8", backgroundColor: "#f6f8fa" };
const thStyle = { padding: "10px 12px", fontWeight: "600", color: "#57606a" };
const trStyle = { borderBottom: "1px solid #eaecef" };
const tdStyle = { padding: "10px 12px", color: "#24292e" };

const milkBadgeStyle = { background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" };
const statusStyle = { color: "#2ea44f", fontWeight: "500", fontSize: "12px" };
const errorStyle = { padding: "12px", backgroundColor: "#ffeef0", color: "#d73a49", borderRadius: "6px", fontSize: "13px", marginBottom: "20px", border: "1px solid #fdaeb7" };
const emptyStyle = { textAlign: "center", padding: "30px", color: "#57606a", fontSize: "13px" };
const loadingCardStyle = { backgroundColor: "#ffffff", borderRadius: "10px", padding: "40px", textAlign: "center", border: "1px solid #e1e4e8", maxWidth: "400px", margin: "100px auto" };
const spinnerStyle = { width: "24px", height: "24px", border: "3px solid #e1e4e8", borderTopColor: "#0366d6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" };
const loadingTextStyle = { fontSize: "13px", color: "#57606a" };

export default MilkList;