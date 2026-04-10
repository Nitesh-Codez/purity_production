import { useEffect, useState } from "react";
import axios from "axios";

const MilkList = () => {

  const [milkList, setMilkList] = useState([]);

  useEffect(() => {

    const fetchMilkList = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/customer/current-month",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setMilkList(res.data.data);

      } catch (error) {
        console.error("Error fetching milk list", error);
      }

    };

    fetchMilkList();

  }, []);

  return (

    <div>

      <h2>Current Month Milk List</h2>

      <table border="1">

        <thead>
          <tr>
            <th>Date</th>
            <th>Milk</th>
          </tr>
        </thead>

        <tbody>

          {milkList.map((item, index) => (
            <tr key={index}>
              <td>{item.delivery_date}</td>
              <td>{item.milk_quantity} L</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );
};

export default MilkList;