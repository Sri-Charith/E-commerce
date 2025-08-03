import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";

const AddProduct = () => {

  const[image,setImage] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [productDetails,setProductDetails] = useState({
      name:"",
      image:"",
      category:"women",
      new_price:"",
      old_price:"",
      description:""
  });

  const [sizes, setSizes] = useState([
    { size: "S", quantity: 0 },
    { size: "M", quantity: 0 },
    { size: "L", quantity: 0 },
    { size: "XL", quantity: 0 },
    { size: "XXL", quantity: 0 }
  ]);

  const AddProduct = async () => {
    // Validation
    if (!productDetails.name || !productDetails.new_price || !productDetails.old_price || !image) {
      alert("Please fill all required fields (name, prices, and image)");
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
    let product = { ...productDetails, sizes };

    // Upload main image
    let formData = new FormData();
    formData.append('product', image);
    
    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers: {
        Accept:'application/json',
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((data) => {dataObj=data});

    if (dataObj.success) {
      product.image = dataObj.image_url;
      
      // Upload additional images if any
      if (additionalImages.length > 0) {
        let additionalFormData = new FormData();
        additionalImages.forEach((img, index) => {
          additionalFormData.append('products', img);
        });
        
        await fetch('http://localhost:4000/upload-multiple', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: additionalFormData,
        })
          .then((resp) => resp.json())
          .then((data) => {
            if (data.success) {
              additionalImageUrls = data.image_urls;
            }
          });
      }
      
      product.images = additionalImageUrls;
      console.log(product);
      await fetch('http://localhost:4000/addproduct', {
      method: 'POST',
      headers: {
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          alert("Product Added Successfully!");
          // Reset form
          setProductDetails({
            name: "",
            image: "",
            category: "women",
            new_price: "",
            old_price: "",
            description: ""
          });
          setSizes([
            { size: "S", quantity: 0 },
            { size: "M", quantity: 0 },
            { size: "L", quantity: 0 },
            { size: "XL", quantity: 0 },
            { size: "XXL", quantity: 0 }
          ]);
          setImage(false);
          setAdditionalImages([]);
        } else {
          alert("Failed to add product: " + (data.error || "Unknown error"));
        }
      });
      
    }
  }

  const changeHandler = (e) => {
    console.log(e);
    setProductDetails({...productDetails,[e.target.name]:e.target.value});
  }

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  }

  const additionalImagesHandler = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages(files);
  };

  const removeAdditionalImage = (index) => {
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(updatedImages);
  };

  const handleSizeQuantityChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setSizes(newSizes);
  }

  return (
    <div className="addproduct">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input type="text" name="name" value={productDetails.name} onChange={(e)=>{changeHandler(e)}} placeholder="Type here" />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input type="text" name="old_price" value={productDetails.old_price} onChange={(e)=>{changeHandler(e)}} placeholder="Type here" />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input type="text" name="new_price" value={productDetails.new_price} onChange={(e)=>{changeHandler(e)}} placeholder="Type here" />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select value={productDetails.category} name="category" className="add-product-selector" onChange={changeHandler}>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select> 
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <textarea 
          name="description" 
          value={productDetails.description} 
          onChange={(e)=>{changeHandler(e)}} 
          placeholder="Enter product description here..."
          rows="4"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
        />
      </div>
      
      {/* Size and Quantity Section */}
      <div className="addproduct-itemfield">
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
      
      <div className="addproduct-itemfield">
        <p>Main Product Image</p>
        <label htmlFor="file-input">
          <img className="addproduct-thumbnail-img" src={!image?upload_area:URL.createObjectURL(image)} alt="" />
        </label>
        <input onChange={(e)=>{imageHandler(e)}} type="file" name="image" id="file-input" accept="image/*" hidden />
      </div>
      
      {/* Additional Images Section */}
      <div className="addproduct-itemfield">
        <p>Additional Product Images (Optional)</p>
        
        {/* Preview Additional Images */}
        {additionalImages.length > 0 && (
          <div className="additional-images-preview">
            <p className="preview-label">Selected Additional Images:</p>
            <div className="images-grid">
              {additionalImages.map((img, index) => (
                <div key={index} className="image-container">
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt={`Additional ${index + 1}`}
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
          <label htmlFor="additional-files-input" className="upload-additional-label">
            <div className="upload-additional-area">
              <span>📷 Add More Images</span>
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
      
      <button className="addproduct-btn" onClick={()=>{AddProduct()}}>ADD</button>
    </div>
  );
};

export default AddProduct;
