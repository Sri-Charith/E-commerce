import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = () => { 
    fetch('http://localhost:4000/allproducts') 
            .then((res) => res.json()) 
            .then((data) => setAllProducts(data))
    }

    useEffect(() => {
      fetchInfo();
    }, [])

    const removeProduct = async (id) => {
      await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify({id:id}),
    })

    fetch('http://localhost:4000/allproducts') 
    .then((res) => res.json()) 
    .then((data) => setAllProducts(data))

    }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
          <p>Products</p>
          <p>Title</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Sizes</p>
          <p>Remove</p>
        </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((e, index) => {
          return (
            <div key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img className="listproduct-product-icon" src={e.image} alt="" />
                <p className="listproduct-product-title">{e.name}</p>
                <p>${e.old_price}</p>
                <p>${e.new_price}</p>
                <p>{e.category}</p>
                <div className="listproduct-sizes">
                  {e.sizes && e.sizes.length > 0 ? (
                    e.sizes.map((size, idx) => (
                      <span key={idx} className="size-tag">
                        {size.size}: {size.quantity}
                      </span>
                    ))
                  ) : (
                    <span className="no-sizes">No sizes</span>
                  )}
                </div>
                <img className="listproduct-remove-icon" onClick={()=>{removeProduct(e.id)}} src={cross_icon} alt="" />
              </div>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListProduct;
