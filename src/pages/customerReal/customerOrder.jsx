import React, {useState} from "react"
import axios from "axios"

function CustomerOrder(){

const [product,setProduct] = useState("")
const [price,setPrice] = useState("")
const [quantity,setQuantity] = useState("")

const total = price * quantity

const handleOrder = async ()=>{

await axios.post("/api/orders",{
customer_id:1,
product_name:product,
price,
quantity
})

alert("Order Placed")
}

return(

<div>

<h2>Place Order</h2>

<input
placeholder="Product"
value={product}
onChange={(e)=>setProduct(e.target.value)}
/>

<input
placeholder="Price"
value={price}
onChange={(e)=>setPrice(e.target.value)}
/>

<input
placeholder="Quantity"
value={quantity}
onChange={(e)=>setQuantity(e.target.value)}
/>

<h3>Total : ₹{total}</h3>

<button onClick={handleOrder}>
Order Now
</button>

</div>

)

}

export default CustomerOrder