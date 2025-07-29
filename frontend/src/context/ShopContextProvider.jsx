import React, { createContext, useState } from "react";
import all_product from "../components/assets/all_product";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < all_product.length; index++) {
    const productId = all_product[index].id;
    cart[productId] = {};
    // Optionally, you can prefill sizes with 0, but it's better to add as needed
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart);

  const addToCart = (itemId, size) => {
    setCartItems((prev) => {
      const prevProduct = prev[itemId] || {};
      const prevQty = prevProduct[size] || 0;
      return {
        ...prev,
        [itemId]: {
          ...prevProduct,
          [size]: prevQty + 1,
        },
      };
    });
  };

  const removeFromCart = (itemId, size) => {
    setCartItems((prev) => {
      const prevProduct = prev[itemId] || {};
      const prevQty = prevProduct[size] || 0;
      let newQty = prevQty - 1;
      if (newQty < 1) {
        // Remove the size key if quantity is 0
        const { [size]: _, ...restSizes } = prevProduct;
        return {
          ...prev,
          [itemId]: restSizes,
        };
      } else {
        return {
          ...prev,
          [itemId]: {
            ...prevProduct,
            [size]: newQty,
          },
        };
      }
    });
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0) {
          let itemInfo = all_product.find(
            (product) => product.id === Number(item)
          );
          totalAmount += itemInfo.new_price * cartItems[item][size];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0) {
          totalItem += cartItems[item][size];
        }
      }
    }
    return totalItem;
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;


/*
| Method  | How it works                                                  |
| ------- | ------------------------------------------------------------- |
| Props   | Like handing a letter personally to each person               |
| Context | Like putting it on a shared notice board — anyone can read it |

🔹 What is React Context?
React Context is a way to share data globally across components 
without passing props manually at every level. 
It solves the problem of prop drilling 
(passing data through multiple layers).
 */

// 🔹 setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
// This is the heart of the function.

// Breakdown:
// setCartItems(...): This is the React state setter from useState(). It updates the cart state.

// (prev) => (...): This is an updater function that takes the previous cart state as prev.

// { ...prev, [itemId]: prev[itemId] + 1 }:
// This uses the spread operator ...prev to copy all previous items in the cart.
// Then it updates the quantity for the current itemId by adding 1.