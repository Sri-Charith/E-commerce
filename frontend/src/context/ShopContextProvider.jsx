import React, { createContext } from "react";
import all_product from "../components/assets/all_product";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const contextValue = { all_product };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider> //This wraps the app and shares all_product with all nested components.
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