import { useEffect, useState } from "react";
import axios from "axios";

const TodayMilk = () => {
  const [milk, setMilk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayMilk = async () => {
      try {
        setLoading(true);

        const userStr = localStorage.getItem("user");

        if (!userStr) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userStr);
        const customerId = userData.id;

        if (!customerId) {
          setError("Customer ID missing.");
          setLoading(false);
          return;
        }

        // 🔥 AXIOS CALL (MAIN PART)
        const res = await axios.get(
          `https://purity-production-backend.onrender.com/api/today/${customerId}`
        );

        console.log("API RESPONSE:", res.data);

        if (res.data.success && res.data.data.length > 0) {
          setMilk(res.data.data[0]);
        } else {
          setMilk(null);
        }

      } catch (err) {
        console.error("Axios Error:", err);
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMilk();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl">

      <h2 className="text-2xl font-bold mb-4">🥛 Today's Milk</h2>

      {milk ? (
        <div className="space-y-4">

          <div className="flex justify-between p-3 bg-gray-100 rounded">
            <span>Quantity</span>
            <span className="font-bold text-blue-600">
              {milk.milk_quantity} L
            </span>
          </div>

          <div className="flex justify-between p-3 bg-gray-100 rounded">
            <span>Date</span>
            <span className="font-medium">
              {new Date(milk.delivery_date).toLocaleDateString("en-IN")}
            </span>
          </div>

          <div className="p-3 bg-green-50 text-green-700 text-center rounded">
            Delivered ✔
          </div>

        </div>
      ) : (
        <p className="text-center text-gray-400">
          Aaj ka milk entry nahi hai
        </p>
      )}

    </div>
  );
};

export default TodayMilk;