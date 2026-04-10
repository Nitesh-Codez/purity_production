import React,{useEffect,useState} from "react"
import axios from "axios"

function AdminOrders(){

const [orders,setOrders] = useState([])

useEffect(()=>{

axios.get("/api/orders")
.then(res=>{
setOrders(res.data)
})

},[])

return(

<div>

<h2>All Orders</h2>

<table border="1">

<thead>
<tr>
<th>ID</th>
<th>Product</th>
<th>Price</th>
<th>Quantity</th>
<th>Total</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{orders.map((o)=>(
<tr key={o.id}>
<td>{o.id}</td>
<td>{o.product_name}</td>
<td>{o.price}</td>
<td>{o.quantity}</td>
<td>{o.total}</td>
<td>{o.status}</td>
</tr>
))}

</tbody>

</table>

</div>

)

}

export default AdminOrders