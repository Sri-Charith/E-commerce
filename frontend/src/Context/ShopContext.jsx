import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const [products,setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/allproducts') 
          .then((res) => res.json()) 
          .then((data) => setProducts(data))

    if(localStorage.getItem("auth-token"))
    {
      fetch('http://localhost:4000/getcart', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'auth-token':`${localStorage.getItem("auth-token")}`,
        'Content-Type':'application/json',
      },
      body: JSON.stringify(),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          setCartItems(data.cartItems || []);
        }
      });
    }

}, [])
  
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalAmount += item.quantity * product.new_price;
      }
    });
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    cartItems.forEach(item => {
      totalItem += item.quantity;
    });
    return totalItem;
  };

  const addToCart = (itemId, size = "", quantity = 1) => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        item => item.productId === itemId && item.size === size
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...prev, { productId: itemId, size, quantity }];
      }
    });
    
    if(localStorage.getItem("auth-token"))
    {
      fetch('http://localhost:4000/addtocart', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'auth-token':`${localStorage.getItem("auth-token")}`,
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        "itemId": itemId,
        "size": size,
        "quantity": quantity
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {console.log(data)});
    }
  };

  const removeFromCart = (itemId, size = "", quantity = 1) => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        item => item.productId === itemId && item.size === size
      );

      if (existingItemIndex !== -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity = Math.max(0, newCart[existingItemIndex].quantity - quantity);
        
        // Remove item if quantity becomes 0
        if (newCart[existingItemIndex].quantity === 0) {
          newCart.splice(existingItemIndex, 1);
        }
        return newCart;
      }
      return prev;
    });
    
    if(localStorage.getItem("auth-token"))
    {
      fetch('http://localhost:4000/removefromcart', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'auth-token':`${localStorage.getItem("auth-token")}`,
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        "itemId": itemId,
        "size": size,
        "quantity": quantity
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {console.log(data)});
    }
  };

  const contextValue = {products, getTotalCartItems, cartItems, addToCart, removeFromCart, getTotalCartAmount };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
