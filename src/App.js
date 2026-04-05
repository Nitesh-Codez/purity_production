import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AddCustomer from "./pages/customers/AddCustomer";
import MilkEntry from "./pages/customers/MilkEntry";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/milk-entry" element={<MilkEntry />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;