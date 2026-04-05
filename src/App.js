import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AddCustomers from "./pages/customers/AddCustomers";
import MilkEntry from "./pages/customers/MilkEntry";
import MilkReport from "./pages/customers/MilkReport";
import MonthlyBillPage from "./pages/customers/MonthlyBillPage";
import CustomerCardsPage from "./pages/customers/CustomerCardsPage"; // Jo abhi banaya hai


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/add-customer" element={<AddCustomers />} />
        <Route path="/milk-entry" element={<MilkEntry />} />
        <Route path="/milk-report" element={<MilkReport />} />
        <Route path="/monthly-bill" element={<MonthlyBillPage />} />
        <Route path="/customer-reports" element={<CustomerCardsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;