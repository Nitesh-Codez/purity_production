import { useEffect, useState } from "react";
import axios from "axios";

const MilkList = () => {
  const now = new Date();

  // Environment variable se URL uthana
  const API_BASE_URL = process.env.REACT_APP_API_URL || "https://purity-production-backend.onrender.com";

  // States
  const [milkList, setMilkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Aapke link ke mutabik userId 19 hai
  const userId = 19; 

  const months = [
    { v: 1, n: "January" }, { v: 2, n: "February" }, { v: 3, n: "March" },
    { v: 4, n: "April" }, { v: 5, n: "May" }, { v: 6, n: "June" },
    { v: 7, n: "July" }, { v: 8, n: "August" }, { v: 9, n: "September" },
    { v: 10, n: "October" }, { v: 11, n: "November" }, { v: 12, n: "December" }
  ];

  const years = [2024, 2025, 2026];

  const fetchMilkData = async () => {
    setLoading(true);
    try {
      // CORRECT PATH INTEGRATION: /api/monthly-bill added here
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
  };

  useEffect(() => {
    fetchMilkData();
  }, [selectedMonth, selectedYear]);

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
        <div style={msgStyle}>Loading records from Render...</div>
      ) : milkList.length > 0 ? (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Quantity (L)</th>
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
                <td style={tdStyle}>Total Monthly Consumption</td>
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

// --- CSS-in-JS Styles ---
const containerStyle = { padding: "20px", maxWidth: "800px", margin: "20px auto", fontFamily: "sans-serif", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" };
const headerStyle = { textAlign: "center", color: "#2c3e50", marginBottom: "30px", borderBottom: "2px solid #3498db", display: "inline-block", width: "100%", paddingBottom: "10px" };
const filterContainerStyle = { display: "flex", gap: "20px", marginBottom: "30px", justifyContent: "center", alignItems: "flex-end", flexWrap: "wrap" };
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "0.85rem", fontWeight: "bold", color: "#7f8c8d" };
const selectStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #dcdde1", backgroundColor: "#f5f6fa", cursor: "pointer", minWidth: "120px" };
const refreshBtnStyle = { padding: "10px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const tableWrapperStyle = { overflowX: "auto" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px" };
const theadRowStyle = { backgroundColor: "#3498db", color: "white" };
const thStyle = { padding: "15px", textAlign: "center" };
const tdStyle = { padding: "12px", textAlign: "center", borderBottom: "1px solid #f1f2f6" };
const zebraRowStyle = { backgroundColor: "#f9f9f9" };
const tfootStyle = { backgroundColor: "#2c3e50", color: "#fff", fontWeight: "bold" };
const msgStyle = { textAlign: "center", padding: "20px", color: "#3498db" };
const noDataStyle = { textAlign: "center", padding: "40px", backgroundColor: "#f5f6fa", borderRadius: "8px", color: "#7f8c8d", border: "1px dashed #dcdde1" };

export default MilkList;