import React, { useContext, useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";

const ProductDisplay = (props) => {
  const {product} = props;
  const {addToCart} = useContext(ShopContext);
  
  // State for size and quantity selection
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  // Get available sizes from product
  const availableSizes = product?.sizes || [];

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setError("");
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      setError("");
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }

    // Check if selected size is available
    const sizeData = availableSizes.find(s => s.size === selectedSize);
    if (!sizeData || sizeData.quantity < quantity) {
      setError("Selected size is not available in requested quantity");
      return;
    }

    addToCart(product.id, selectedSize, quantity);
    setError("");
    setQuantity(1);
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt="img" />
          <img src={product.image} alt="img" />
          <img src={product.image} alt="img" />
          <img src={product.image} alt="img" />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={product.image} alt="img" />
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
          <div className="productdisplay-right-price-old">${product.old_price}</div>
          <div className="productdisplay-right-price-new">${product.new_price}</div>
        </div>
        <div className="productdisplay-right-description">
          {product.description || "A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment."}
        </div>
        
        {/* Size Selection */}
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            {availableSizes.map((sizeData, index) => (
              <div 
                key={index}
                className={`size-option ${selectedSize === sizeData.size ? 'selected' : ''} ${sizeData.quantity === 0 ? 'out-of-stock' : ''}`}
                onClick={() => sizeData.quantity > 0 && handleSizeSelect(sizeData.size)}
              >
                {sizeData.size}
                {sizeData.quantity === 0 && <span className="out-of-stock-label">Out of Stock</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="productdisplay-right-quantity">
          <h1>Quantity</h1>
          <div className="quantity-selector">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="quantity-btn"
            >
              -
            </button>
            <span className="quantity-display">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="quantity-btn"
            >
              +
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        <button onClick={handleAddToCart} className="add-to-cart-btn">ADD TO CART</button>
        <p className="productdisplay-right-category"><span>Category :</span> {product.category}</p>
        <p className="productdisplay-right-category"><span>Tags :</span> Modern, Latest</p>
      </div>
    </div>
  );
};

export default ProductDisplay;
