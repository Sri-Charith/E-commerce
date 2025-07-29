import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../context/ShopContextProvider";
import remove_icon from "../assets/cart_cross_icon.png";

const CartItems = () => {
  const { all_product, cartItems, addToCart, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  return (
    <div className="cartItems">
      <div className="cartItems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Size</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {all_product.map((e) => {
        const sizes = cartItems[e.id] ? Object.keys(cartItems[e.id]) : [];
        return sizes.map((size) => {
          if (cartItems[e.id][size] > 0) {
            return (
              <div key={e.id + '-' + size}>
                <div className="cartItems-format cartItems-format-main">
                  <img src={e.image} alt="" className="cartItem-product-icon" />
                  <p>{e.name}</p>
                  <p>{size}</p>
                  <p>$ {e.new_price}</p>
                  <div className="cartItem-quantity-controls">
                    <button onClick={() => removeFromCart(e.id, size)}>-</button>
                    <span>{cartItems[e.id][size]}</span>
                    <button onClick={() => addToCart(e.id, size)}>+</button>
                  </div>
                  <p>$ {e.new_price * cartItems[e.id][size]}</p>
                  <img
                    className="cartItem-remove-icon"
                    src={remove_icon}
                    alt="remove"
                    onClick={() => removeFromCart(e.id, size)}
                  />
                </div>
                <hr />
              </div>
            );
          }
          return null;
        });
      })}
      <div className="cartItems-down">
        <div className="cartItems-total">
          <h1>Cart Total</h1>
          <div>
            <div className="cartItems-total-item">
              <p>SubTotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartItems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartItems-total-item">
              <h3>Total</h3>
              <h3>${getTotalCartAmount()}</h3>
            </div>
          </div>
          <button>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartItems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartItems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;