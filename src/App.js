import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

// Yahan path check kar lena agar file 'pages/customers' ke andar hai
import AddCustomer from "./pages/customers/AddCustomer";

function App() {
  return (
    <BrowserRouter>
      {/* Sirf EK baar Routes hona chahiye */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/add-customer" element={<AddCustomer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;