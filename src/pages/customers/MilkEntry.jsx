import React, { useEffect, useState } from "react";
import axios from "axios";

function MilkEntry() {

  const [customers,setCustomers] = useState([]);
  const [milk,setMilk] = useState({});

  const API = process.env.REACT_APP_API_URL;

  useEffect(()=>{

    axios.get(`${API}/api/customers`)
    .then(res=>{
      setCustomers(res.data.data);
    });

  },[]);


  const handleChange = (id,value)=>{

    setMilk({
      ...milk,
      [id]:value
    });

  };


  const saveMilk = async(id)=>{

    const quantity = milk[id];

    if(!quantity) return alert("Enter milk");

    await axios.post(`${API}/api/milk-entry`,{
      user_id:id,
      milk_quantity:quantity
    });

    alert("Saved");

  };


  return(

    <div>

      <h2>Daily Milk Entry</h2>

      <table border="1">

        <thead>
          <tr>
            <th>Customer</th>
            <th>Milk</th>
            <th>Save</th>
          </tr>
        </thead>

        <tbody>

        {customers.map(c=>(

          <tr key={c.id}>

            <td>{c.name}</td>

            <td>

              <input
              type="number"
              step="0.25"
              onChange={(e)=>handleChange(c.id,e.target.value)}
              />

            </td>

            <td>

              <button onClick={()=>saveMilk(c.id)}>
                Save
              </button>

            </td>

          </tr>

        ))}

        </tbody>

      </table>

    </div>

  );
}

export default MilkEntry;