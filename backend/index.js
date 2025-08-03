const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));


//Image Storage Engine 
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
      console.log(file);
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage: storage})
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:4000/images/${req.file.filename}`
    })
})
app.use('/images', express.static('upload/images'));

// MiddleWare to fetch user from database
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  cartItems: [{
    productId: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  date: {
    type: Date,
    default: Date.now,
  },
});

// Schema for creating Product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number
  },
  old_price: {
    type: Number
  },
  description: {
    type: String,
    default: "Product description not available"
  },
  sizes: [
    {
      size: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        default: 0
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});

app.get("/", (req, res) => {
  res.send("Root");
});

//Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
    let success = false;
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
			success = true;
      console.log(user.id);
			const token = jwt.sign(data, 'secret_ecom');
			res.json({ success, token });
        }
        else {
            return res.status(400).json({success: success, errors: "please try with correct email/password"})
        }
    }
    else {
        return res.status(400).json({success: success, errors: "please try with correct email/password"})
    }
})

//Create an endpoint at ip/auth for regestring the user in data base & sending token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
        let success = false;
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: success, errors: "existing user found with this email" });
        }
        let cart = {};
          for (let i = 0; i < 300; i++) {
          cart[i] = 0;
        }
        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });
        await user.save();
        const data = {
            user: {
                id: user.id
            }
        }
        
        const token = jwt.sign(data, 'secret_ecom');
        success = true; 
        res.json({ success, token })
    })

app.get("/allproducts", async (req, res) => {
	let products = await Product.find({});
  console.log("All Products");
    res.send(products);
});

app.get("/newcollections", async (req, res) => {
	let products = await Product.find({});
  let arr = products.slice(1).slice(-8);
  console.log("New Collections");
  res.send(arr);
});

app.get("/popularinwomen", async (req, res) => {
	let products = await Product.find({});
  let arr = products.splice(0,  4);
  console.log("Popular In Women");
  res.send(arr);
});

//Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  try {
    console.log("Add Cart");
    const { itemId, size, quantity = 1 } = req.body;
    
    if (!itemId || !size) {
      return res.status(400).json({ success: false, error: "Item ID and size are required" });
    }

    let userData = await Users.findOne({ _id: req.user.id });
    
    // Check if item already exists in cart with same size
    const existingItemIndex = userData.cartItems.findIndex(
      item => item.productId === itemId && item.size === size
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      userData.cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      userData.cartItems.push({
        productId: itemId,
        size: size,
        quantity: quantity
      });
    }
    
    await Users.findOneAndUpdate(
      { _id: req.user.id }, 
      { cartItems: userData.cartItems }
    );
    
    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, error: "Failed to add to cart" });
  }
});

//Create an endpoint for removing the product from cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  try {
    console.log("Remove Cart");
    const { itemId, size, quantity = 1 } = req.body;
    
    if (!itemId || !size) {
      return res.status(400).json({ success: false, error: "Item ID and size are required" });
    }

    let userData = await Users.findOne({ _id: req.user.id });
    
    // Find the item in cart
    const existingItemIndex = userData.cartItems.findIndex(
      item => item.productId === itemId && item.size === size
    );

    if (existingItemIndex !== -1) {
      // Reduce quantity
      userData.cartItems[existingItemIndex].quantity = Math.max(0, userData.cartItems[existingItemIndex].quantity - quantity);
      
      // Remove item if quantity becomes 0
      if (userData.cartItems[existingItemIndex].quantity === 0) {
        userData.cartItems.splice(existingItemIndex, 1);
      }
    }
    
    await Users.findOneAndUpdate(
      { _id: req.user.id }, 
      { cartItems: userData.cartItems }
    );
    
    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, error: "Failed to remove from cart" });
  }
});

//Create an endpoint for getting cart data
app.post('/getcart', fetchuser, async (req, res) => {
  try {
    console.log("Get Cart");

    const userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, cartItems: userData.cartItems });

  } catch (error) {
    console.error("Error in /getcart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
  


app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1;
    } else {
      id = 1;
    }

    // Validate sizes array
    const sizes = req.body.sizes || [];
    if (!Array.isArray(sizes)) {
      return res.status(400).json({ success: false, error: "Sizes must be an array" });
    }

    // Validate each size object
    for (let sizeObj of sizes) {
      if (!sizeObj.size || typeof sizeObj.quantity !== 'number' || sizeObj.quantity < 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Each size must have 'size' (string) and 'quantity' (number >= 0)" 
        });
      }
    }

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      description: req.body.description || "Product description not available",
      sizes: sizes
    });

    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({ success: true, name: req.body.name, id: id });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, error: "Failed to add product" });
  }
});

app.post("/removeproduct", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    console.log("Removed");
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, error: "Failed to remove product" });
  }
});

// Add new endpoint to update product
app.put("/updateproduct", async (req, res) => {
  try {
    const { id, name, image, category, new_price, old_price, description, sizes } = req.body;
    
    // Validate sizes array if provided
    if (sizes && !Array.isArray(sizes)) {
      return res.status(400).json({ success: false, error: "Sizes must be an array" });
    }

    if (sizes) {
      for (let sizeObj of sizes) {
        if (!sizeObj.size || typeof sizeObj.quantity !== 'number' || sizeObj.quantity < 0) {
          return res.status(400).json({ 
            success: false, 
            error: "Each size must have 'size' (string) and 'quantity' (number >= 0)" 
          });
        }
      }
    }

    const updateData = {
      name,
      image,
      category,
      new_price,
      old_price,
      description,
      sizes
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const product = await Product.findOneAndUpdate(
      { id: id },
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    console.log("Updated");
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, error: "Failed to update product" });
  }
});

// Add endpoint to get product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ success: false, error: "Failed to get product" });
  }
});

app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
