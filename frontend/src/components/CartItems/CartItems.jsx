import React, { useContext } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";

const CartItems = () => {
  const {products} = useContext(ShopContext);
  const {cartItems,removeFromCart,getTotalCartAmount} = useContext(ShopContext);

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Size</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {cartItems.map((item, index) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        return (
          <div key={index}>
            <div className="cartitems-format">
              <img className="cartitems-product-icon" src={product.image} alt="" />
              <p className="cartitems-product-title">{product.name}</p>
              <p className="cartitems-size">{item.size}</p>
              <p>${product.new_price}</p>
              <button className="cartitems-quatity">{item.quantity}</button>
              <p>${product.new_price * item.quantity}</p>
              <img 
                onClick={() => {removeFromCart(item.productId, item.size, 1)}} 
                className="cartitems-remove-icon" 
                src={cross_icon} 
                alt="" 
              />
            </div>
            <hr />
          </div>
        );
      })}
      
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${getTotalCartAmount()}</h3>
            </div>
          </div>
          <button>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
