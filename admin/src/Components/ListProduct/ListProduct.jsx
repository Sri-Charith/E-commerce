import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import edit_icon from '../Assets/edit_icon.svg'

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("date-desc");
  const navigate = useNavigate();

  const fetchInfo = () => { 
    fetch('http://localhost:4000/allproducts') 
            .then((res) => res.json()) 
            .then((data) => {
              setAllProducts(data);
              setFilteredProducts(data);
            })
    }

    useEffect(() => {
      fetchInfo();
    }, [])

    // Filter and sort products
    useEffect(() => {
      let filtered = [...allproducts];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Category filter
      if (categoryFilter !== "all") {
        filtered = filtered.filter(product => product.category === categoryFilter);
      }

      // Stock filter
      if (stockFilter !== "all") {
        if (stockFilter === "in-stock") {
          filtered = filtered.filter(product => {
            const totalStock = product.sizes?.reduce((sum, size) => sum + size.quantity, 0) || 0;
            return totalStock > 0;
          });
        } else if (stockFilter === "out-of-stock") {
          filtered = filtered.filter(product => {
            const totalStock = product.sizes?.reduce((sum, size) => sum + size.quantity, 0) || 0;
            return totalStock === 0;
          });
        }
      }

      // Price range filter
      if (priceRange.min !== "" || priceRange.max !== "") {
        filtered = filtered.filter(product => {
          const price = product.new_price;
          const minPrice = priceRange.min === "" ? 0 : parseFloat(priceRange.min);
          const maxPrice = priceRange.max === "" ? Infinity : parseFloat(priceRange.max);
          return price >= minPrice && price <= maxPrice;
        });
      }

      // Sorting
      switch (sortBy) {
        case "name-asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price-asc":
          filtered.sort((a, b) => a.new_price - b.new_price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.new_price - a.new_price);
          break;
        case "date-asc":
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case "date-desc":
        default:
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
      }

      setFilteredProducts(filtered);
    }, [allproducts, searchTerm, categoryFilter, stockFilter, priceRange, sortBy]);

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
      
      {/* Search and Filter Controls */}
      <div className="listproduct-controls">
        {/* Search Bar */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Filters Row */}
        <div className="filters-row">
          {/* Category Filter */}
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kid">Kid</option>
            </select>
          </div>
          
          {/* Stock Filter */}
          <div className="filter-group">
            <label>Stock:</label>
            <select 
              value={stockFilter} 
              onChange={(e) => setStockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div className="filter-group price-range">
            <label>Price Range:</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                className="price-input"
              />
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="results-info">
          <span>Showing {filteredProducts.length} of {allproducts.length} products</span>
        </div>
      </div>
      <div className="listproduct-format-main">
          <p>Products</p>
          <p>Title</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Sizes</p>
          <p>Edit</p>
          <p>Remove</p>
        </div>
      <div className="listproduct-allproducts">
        <hr />
        {filteredProducts.map((e, index) => {
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
                <img 
                  className="listproduct-edit-icon" 
                  onClick={() => navigate(`/editproduct/${e.id}`)} 
                  src={edit_icon} 
                  alt="Edit" 
                  title="Edit Product"
                />
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
