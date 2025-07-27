import React, { useContext } from "react";
import "./ProductDisplay.css";
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { ShopContext } from "../../context/ShopContextProvider";

const ProductDisplay = (props) => {
  const { product } = props;
  const {addToCart} = useContext(ShopContext)
  return (
    <div className="productDisplay">
      {console.log(props.product)}
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={product.image} alt="" />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            ${product.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            ${product.new_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          Made from ultra-soft, high-quality cotton blend, this sweatshirt
          ensures that your child stays warm and comfortable throughout the day.
          The fabric is gentle on the skin, making it ideal for playtime,
          school, or cozying up on chilly evenings.
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button onClick={()=>{addToCart(product.id)}}>ADD TO CART</button>
        <p className="productdisplay-right-category"><span>Category : </span>Woman, T-Shirt, Crop Top</p>
        <p className="productdisplay-right-category"><span>Tags : </span>Modern, latest</p>
      </div>
    </div>
  );
};

export default ProductDisplay;



  /*
  const { addToCart } = useContext(ShopContext);
📌 What it means:
ShopContext is like a shared storage for your app (cart, products, etc.).

useContext(ShopContext) lets you access things stored in that shared place.

{ addToCart } means you're picking just the addToCart function from that storage.

Now you can use addToCart(product.id) in your component to add a product to the cart. 
  */

{/* 
🔹 useContext is a React Hook that allows a component to read values from a context directly, without prop drilling.
const { addToCart } = useContext(ShopContext);
You are accessing the addToCart function from the global ShopContext, 
which was created using React.createContext() and provided at a higher level using <ShopContext.Provider>.

🧠 Why use useContext?
Without context, you'd have to pass props down manually through every component level (called "prop drilling").

Instead, with useContext, any component in the tree can access shared data or functions — 
like addToCart() here — from the global context. */}