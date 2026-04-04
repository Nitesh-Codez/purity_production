import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login/>} />

        <Route path="/owner" element={<OwnerDashboard/>} />

        <Route path="/customer" element={<CustomerDashboard/>} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;