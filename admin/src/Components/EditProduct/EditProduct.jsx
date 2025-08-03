import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditProduct.css";
import upload_area from "../Assets/upload_area.svg";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
    description: ""
  });

  const [sizes, setSizes] = useState([
    { size: "S", quantity: 0 },
    { size: "M", quantity: 0 },
    { size: "L", quantity: 0 },
    { size: "XL", quantity: 0 },
    { size: "XXL", quantity: 0 }
  ]);

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:4000/product/${id}`);
        const data = await response.json();
        
        if (data.success) {
          const product = data.product;
          setProductDetails({
            name: product.name,
            image: product.image,
            category: product.category,
            new_price: product.new_price,
            old_price: product.old_price,
            description: product.description || ""
          });
          
          // Set existing additional images
          if (product.images && product.images.length > 0) {
            setExistingImages(product.images);
          }
          
          // Update sizes with product data
          if (product.sizes && product.sizes.length > 0) {
            const updatedSizes = sizes.map(sizeObj => {
              const productSize = product.sizes.find(ps => ps.size === sizeObj.size);
              return productSize ? { ...sizeObj, quantity: productSize.quantity } : sizeObj;
            });
            setSizes(updatedSizes);
          }
        } else {
          alert("Product not found");
          navigate("/listproduct");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Error loading product");
        navigate("/listproduct");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const updateProduct = async () => {
    // Validation
    if (!productDetails.name || !productDetails.new_price || !productDetails.old_price) {
      alert("Please fill all required fields (name and prices)");
      return;
    }

    // Check if at least one size has quantity > 0
    const hasStock = sizes.some(size => size.quantity > 0);
    if (!hasStock) {
      alert("Please add quantity for at least one size");
      return;
    }

    let dataObj;
    let additionalImageUrls = [];
    let product = { ...productDetails, sizes, id: parseInt(id) };

    // Handle main image upload if new image is selected
    if (image) {
      let formData = new FormData();
      formData.append('product', image);
      
      await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      })
        .then((resp) => resp.json())
        .then((data) => { dataObj = data });

      if (dataObj.success) {
        product.image = dataObj.image_url;
      }
    }

    // Handle additional images upload
    if (additionalImages.length > 0) {
      let formData = new FormData();
      additionalImages.forEach((img, index) => {
        formData.append('products', img);
      });
      
      await fetch('http://localhost:4000/upload-multiple', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.success) {
            additionalImageUrls = data.image_urls;
          }
        });
    }

    // Combine existing images with new ones
    const allAdditionalImages = [...existingImages, ...additionalImageUrls];
    product.images = allAdditionalImages;

    // Update product
    await fetch('http://localhost:4000/updateproduct', {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          alert("Product Updated Successfully!");
          navigate("/listproduct");
        } else {
          alert("Failed to update product: " + (data.error || "Unknown error"));
        }
      });
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const additionalImagesHandler = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages(files);
  };

  const removeExistingImage = (index) => {
    const updatedImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedImages);
  };

  const removeAdditionalImage = (index) => {
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(updatedImages);
  };

  const handleSizeQuantityChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setSizes(newSizes);
  };

  if (loading) {
    return (
      <div className="editproduct">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="editproduct">
      <h1>Edit Product</h1>
      <div className="editproduct-itemfield">
        <p>Product title</p>
        <input 
          type="text" 
          name="name" 
          value={productDetails.name} 
          onChange={changeHandler} 
          placeholder="Type here" 
        />
      </div>
      <div className="editproduct-price">
        <div className="editproduct-itemfield">
          <p>Price</p>
          <input 
            type="text" 
            name="old_price" 
            value={productDetails.old_price} 
            onChange={changeHandler} 
            placeholder="Type here" 
          />
        </div>
        <div className="editproduct-itemfield">
          <p>Offer Price</p>
          <input 
            type="text" 
            name="new_price" 
            value={productDetails.new_price} 
            onChange={changeHandler} 
            placeholder="Type here" 
          />
        </div>
      </div>
      <div className="editproduct-itemfield">
        <p>Product category</p>
        <select 
          value={productDetails.category} 
          name="category" 
          className="edit-product-selector" 
          onChange={changeHandler}
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="editproduct-itemfield">
        <p>Product description</p>
        <textarea 
          name="description" 
          value={productDetails.description} 
          onChange={changeHandler} 
          placeholder="Enter product description here..."
          rows="4"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
        />
      </div>
      
      {/* Size and Quantity Section */}
      <div className="editproduct-itemfield">
        <p>Size and Quantity</p>
        <div className="sizes-container">
          {sizes.map((sizeData, index) => (
            <div key={index} className="size-quantity-row">
              <span className="size-label">{sizeData.size}:</span>
              <input 
                type="number" 
                value={sizeData.quantity} 
                onChange={(e) => handleSizeQuantityChange(index, 'quantity', e.target.value)}
                placeholder="Quantity"
                min="0"
                style={{ width: '80px', padding: '5px', marginLeft: '10px' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="editproduct-itemfield">
        <p>Main Product Image</p>
        <p className="current-image-label">Current Main Image:</p>
        <img 
          className="editproduct-current-img" 
          src={productDetails.image} 
          alt="Current product" 
          style={{ width: '120px', height: '120px', objectFit: 'cover', marginBottom: '10px' }}
        />
        <p className="new-image-label">Upload New Main Image (optional):</p>
        <label htmlFor="file-input">
          <img 
            className="editproduct-thumbnail-img" 
            src={!image ? upload_area : URL.createObjectURL(image)} 
            alt="" 
          />
        </label>
        <input 
          onChange={imageHandler} 
          type="file" 
          name="image" 
          id="file-input" 
          accept="image/*"
          hidden 
        />
      </div>

      {/* Additional Images Section */}
      <div className="editproduct-itemfield">
        <p>Additional Product Images</p>
        
        {/* Existing Additional Images */}
        {existingImages.length > 0 && (
          <div className="existing-images-section">
            <p className="current-image-label">Current Additional Images:</p>
            <div className="images-grid">
              {existingImages.map((imgUrl, index) => (
                <div key={index} className="image-container">
                  <img 
                    src={imgUrl} 
                    alt={`Additional ${index + 1}`}
                    className="additional-image"
                  />
                  <button 
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeExistingImage(index)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* New Additional Images Preview */}
        {additionalImages.length > 0 && (
          <div className="new-images-section">
            <p className="new-image-label">New Additional Images:</p>
            <div className="images-grid">
              {additionalImages.map((img, index) => (
                <div key={index} className="image-container">
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt={`New ${index + 1}`}
                    className="additional-image"
                  />
                  <button 
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeAdditionalImage(index)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload Additional Images */}
        <div className="upload-additional-section">
          <p className="new-image-label">Add More Images (optional, max 5):</p>
          <label htmlFor="additional-files-input" className="upload-additional-label">
            <div className="upload-additional-area">
              <span>📷 Click to add more images</span>
              <small>Select multiple images (max 5)</small>
            </div>
          </label>
          <input 
            onChange={additionalImagesHandler} 
            type="file" 
            name="additionalImages" 
            id="additional-files-input" 
            accept="image/*"
            multiple
            hidden 
          />
        </div>
      </div>
      
      <div className="editproduct-buttons">
        <button className="editproduct-btn save-btn" onClick={updateProduct}>
          Save Changes
        </button>
        <button 
          className="editproduct-btn cancel-btn" 
          onClick={() => navigate("/listproduct")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
