import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const MilkList = () => {
  const now = new Date();

  // Environment variable
  const API_BASE_URL = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  // States
  const [milkList, setMilkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const userId = 19; 

  const months = [
    { v: 1, n: "January" }, { v: 2, n: "February" }, { v: 3, n: "March" },
    { v: 4, n: "April" }, { v: 5, n: "May" }, { v: 6, n: "June" },
    { v: 7, n: "July" }, { v: 8, n: "August" }, { v: 9, n: "September" },
    { v: 10, n: "October" }, { v: 11, n: "November" }, { v: 12, n: "December" }
  ];

  const years = [2024, 2025, 2026];

  // Logic wrapped in useCallback to fix Vercel Build Error
  const fetchMilkData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/monthly-bill/customer/${userId}/milk`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear
          }
        }
      );

      if (res.data.success) {
        setMilkList(res.data.data);
      } else {
        setMilkList([]);
      }
    } catch (error) {
      console.error("Fetch Error details:", error.response || error.message);
      setMilkList([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, selectedMonth, selectedYear, userId]); // Dependencies added here

  // useEffect now correctly depends on fetchMilkData
  useEffect(() => {
    fetchMilkData();
  }, [fetchMilkData]);

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Milk Delivery History</h2>

      {/* Filter Section */}
      <div style={filterContainerStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Month</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))} 
            style={selectStyle}
          >
            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Year</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))} 
            style={selectStyle}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <button onClick={fetchMilkData} style={refreshBtnStyle}>
          ⟳ Refresh
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={msgStyle}>Loading records from Server...</div>
      ) : milkList.length > 0 ? (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {milkList.map((item, index) => (
                <tr key={index} style={index % 2 === 0 ? zebraRowStyle : {}}>
                  <td style={tdStyle}>
                    {new Date(item.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                  </td>
                  <td style={tdStyle}><strong>{item.milk_quantity} L</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={tfootStyle}>
                <td style={tdStyle}>Total Monthly</td>
                <td style={tdStyle}>
                  {milkList.reduce((acc, curr) => acc + parseFloat(curr.milk_quantity || 0), 0).toFixed(2)} Litres
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div style={noDataStyle}>
          No records found for {months.find(m => m.v === selectedMonth)?.n} {selectedYear}
        </div>
      )}
    </div>
  );
};

// --- Updated UI Styles (Premium Look) ---
const containerStyle = { 
  padding: "20px", 
  maxWidth: "800px", 
  margin: "20px auto", 
  fontFamily: "'Segoe UI', Roboto, sans-serif", 
  backgroundColor: "#ffffff", 
  borderRadius: "16px", 
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)" 
};

const headerStyle = { 
  textAlign: "center", 
  color: "#1a237e", 
  marginBottom: "25px", 
  fontSize: "24px",
  fontWeight: "700"
};

const filterContainerStyle = { 
  display: "flex", 
  gap: "15px", 
  marginBottom: "25px", 
  justifyContent: "center", 
  alignItems: "flex-end", 
  flexWrap: "wrap",
  background: "#f8f9fa",
  padding: "15px",
  borderRadius: "12px"
};

const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "0.75rem", fontWeight: "bold", color: "#546e7a", textTransform: "uppercase" };

const selectStyle = { 
  padding: "10px 15px", 
  borderRadius: "8px", 
  border: "1px solid #cfd8dc", 
  backgroundColor: "#fff", 
  cursor: "pointer", 
  outline: "none",
  fontSize: "14px",
  fontWeight: "600"
};

const refreshBtnStyle = { 
  padding: "10px 20px", 
  backgroundColor: "#1a237e", 
  color: "white", 
  border: "none", 
  borderRadius: "8px", 
  cursor: "pointer", 
  fontWeight: "bold",
  transition: "0.3s"
};

const tableWrapperStyle = { overflowX: "auto", borderRadius: "12px", border: "1px solid #e0e0e0" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadRowStyle = { backgroundColor: "#1a237e", color: "white" };
const thStyle = { padding: "15px", textAlign: "center", fontSize: "14px" };
const tdStyle = { padding: "12px", textAlign: "center", borderBottom: "1px solid #eceff1", color: "#37474f" };
const zebraRowStyle = { backgroundColor: "#fcfdff" };
const tfootStyle = { backgroundColor: "#e8eaf6", color: "#1a237e", fontWeight: "800" };
const msgStyle = { textAlign: "center", padding: "20px", color: "#1a237e", fontWeight: "600" };
const noDataStyle = { textAlign: "center", padding: "40px", backgroundColor: "#eceff1", borderRadius: "12px", color: "#455a64", border: "1px dashed #b0bec5" };

export default MilkList;