import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContextProvider";
import dropdown_icon from "../components/assets/dropdown_icon.png";
import Item from "../components/Item/Item";
import "./CSS/ShopCategory.css";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  //🔹 What is useContext?
//useContext is a React Hook that lets you access data from a context 
// (like ShopContext) that you’ve provided higher up in your component tree.

  return (
    <div className="shop-category">
      <img className="shopCategory-banner" src={props.banner} alt="" />
      <div className="shopCategory-indexSort">
        <p>
          <span>Showing 1–12</span> out of 36 products
        </p>
        <div className="shopCategory-short">
          sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopCategory-products">
        {all_product
          .filter(item => item.category === props.category)
          .map((item, i) => (
          <Item
        key={i}
        id={item.id}
        name={item.name}
        image={item.image}
        new_price={item.new_price}
        old_price={item.old_price}
      />
    ))}
      </div>
    </div>
  );
};

export default ShopCategory;


// ✅ 2. .filter(item => item.category === props.category)
// Filters only the products that match the selected category.
// If props.category is "men", it keeps only items with item.category === "men".


// ✅ 3. .map((item, i) => ( <Item ... /> ))
// For each filtered product, it creates an <Item /> component.
// It passes data as props to the component: