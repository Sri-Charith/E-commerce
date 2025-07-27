import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
const Item = (props) => {
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}><img onClick={window.scrollTo(0,0)} src={props.image} alt="-product-"/></Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">
            ${props.new_price}
        </div>
        <div className="item-price-old">
            ${props.old_price}
        </div>
      </div>
    </div>
  )
}

export default Item



//<Link to={`/product/${props.id}`}
// is a React Router Link component that navigates the user to a dynamic product page.

// Breakdown:
// 🔗 <Link to={...}>
// This is like an <a href="...">, but specifically for React Router.

// It changes the URL without reloading the page.

// Enables client-side routing in single-page applications (SPA).

// 💡 to={/product/${props.id}}
// Uses template literals (backticks `) in JavaScript.

// ${props.id} dynamically injects the id from props.

// For example, if props.id = 123, this becomes:
// 👉 /product/123

// ✅ Why do we use it?
// This is useful when you have a list of products, 
// and each one needs to link to its own detail page. Instead of hardcoding URLs,
//  you pass each product's ID dynamically.