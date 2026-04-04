import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {

    try {

      const res = await axios.post("http://localhost:5000/login", {
        name: name
      });

      const role = res.data.role;

      if (role === "owner") {
        navigate("/owner");
      } 
      else if (role === "customer") {
        navigate("/customer");
      }

    } catch (error) {
      alert("User not found");
    }

  };

  return (

    <div style={{textAlign:"center", marginTop:"100px"}}>

      <h2>Login</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleLogin}>
        Login
      </button>

    </div>

  );
}

export default Login;