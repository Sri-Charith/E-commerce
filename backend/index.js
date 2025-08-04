const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

// Multiple image upload endpoint
app.post("/upload-multiple", upload.array('products', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: "No files uploaded" });
        }
        
        const imageUrls = req.files.map(file => 
            `http://localhost:4000/images/${file.filename}`
        );
        
        res.json({
            success: true,
            image_urls: imageUrls
        });
    } catch (error) {
        console.error("Error uploading multiple images:", error);
        res.status(500).json({ success: false, error: "Failed to upload images" });
    }
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


// Schema for creating user model (customers)
const Users = mongoose.model("Users", {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user'
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

// Schema for creating admin model
const Admins = mongoose.model("Admins", {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin'
  },
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
  images: {
    type: [String],
    default: []
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
  
  try {
    // Check both Users and Admins collections
    let user = await Users.findOne({ email: req.body.email });
    let admin = await Admins.findOne({ email: req.body.email });
    
    // If admin account exists, prioritize it over user account
    if (admin) {
      user = admin;
    }
    
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
        success = true;
        console.log(`${user.role} login:`, user.id);
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ 
          success, 
          token, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
      } else {
        return res.status(400).json({success: success, errors: "Incorrect password"});
      }
    } else {
      return res.status(400).json({success: success, errors: "No account found with this email"});
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({success: false, errors: "Server error during login"});
  }
})

//Create an endpoint at ip/auth for registering users and admins in separate collections
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  
  try {
    const { username, email, password, role } = req.body;
    const userRole = role || 'user';
    
    if (userRole === 'admin') {
      // Check if admin already exists
      let existingAdmin = await Admins.findOne({ email: email });
      if (existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          errors: "An admin account with this email already exists" 
        });
      }
      
      // Create new admin
      const admin = new Admins({
        name: username,
        email: email,
        password: password,
        role: 'admin'
      });
      
      await admin.save();
      
      const data = {
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      }
      
      const token = jwt.sign(data, 'secret_ecom');
      success = true;
      
      res.json({ 
        success, 
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
      
    } else {
      // Check if user already exists
      let existingUser = await Users.findOne({ email: email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          errors: "A user account with this email already exists" 
        });
      }
      
      // Create cart data for user
      let cart = {};
      for (let i = 0; i < 300; i++) {
        cart[i] = 0;
      }
      
      // Create new user
      const user = new Users({
        name: username,
        email: email,
        password: password,
        role: 'user',
        cartData: cart,
      });
      
      await user.save();
      
      const data = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
      
      const token = jwt.sign(data, 'secret_ecom');
      success = true;
      
      res.json({ 
        success, 
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false, 
      errors: "Server error during signup"
    });
  }
});

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
      images: req.body.images || [],
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
    const { id, name, image, images, category, new_price, old_price, description, sizes } = req.body;
    
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
      images,
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

// ===== ADMIN MANAGEMENT ENDPOINTS =====

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin privileges required' });
  }
  next();
};

// Get all admins (admin only)
app.get('/admins', fetchuser, requireAdmin, async (req, res) => {
  try {
    const admins = await Admins.find({}, { password: 0 }); // Exclude passwords
    res.json({ success: true, admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admins' });
  }
});

// Create new admin (admin only)
app.post('/create-admin', fetchuser, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admins.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
    }
    
    // Create new admin
    const newAdmin = new Admins({
      name,
      email,
      password, // In production, hash this password
      role: 'admin'
    });
    
    await newAdmin.save();
    
    // Return admin data without password
    const { password: _, ...adminData } = newAdmin.toObject();
    res.json({ success: true, admin: adminData, message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, error: 'Failed to create admin' });
  }
});

// Update admin (admin only)
app.put('/update-admin/:id', fetchuser, requireAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminId = req.params.id;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }
    
    // Check if email is already taken by another admin
    const existingAdmin = await Admins.findOne({ email, _id: { $ne: adminId } });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Email already taken by another admin' });
    }
    
    const updatedAdmin = await Admins.findByIdAndUpdate(
      adminId,
      { name, email },
      { new: true, select: '-password' }
    );
    
    if (!updatedAdmin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    
    res.json({ success: true, admin: updatedAdmin, message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin' });
  }
});

// Delete admin (admin only)
app.delete('/delete-admin/:id', fetchuser, requireAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (adminId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own admin account' });
    }
    
    const deletedAdmin = await Admins.findByIdAndDelete(adminId);
    
    if (!deletedAdmin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ success: false, error: 'Failed to delete admin' });
  }
});

// Change admin password (admin only)
app.put('/change-admin-password/:id', fetchuser, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const adminId = req.params.id;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }
    
    const updatedAdmin = await Admins.findByIdAndUpdate(
      adminId,
      { password: newPassword }, // In production, hash this password
      { new: true, select: '-password' }
    );
    
    if (!updatedAdmin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    
    res.json({ success: true, message: 'Admin password updated successfully' });
  } catch (error) {
    console.error('Error updating admin password:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin password' });
  }
});

// ===== STRIPE PAYMENT ENDPOINTS =====

// Create payment intent
app.post('/create-payment-intent', fetchuser, async (req, res) => {
  try {
    const { amount, currency = 'usd', shippingInfo, cartItems } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    if (!shippingInfo) {
      return res.status(400).json({ success: false, error: 'Shipping information is required' });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart items are required' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        userId: req.user.id,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        phone: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.district}, ${shippingInfo.state} - ${shippingInfo.pincode}`,
        itemCount: cartItems.length.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment intent' });
  }
});

// Confirm payment and create order
app.post('/confirm-payment', fetchuser, async (req, res) => {
  try {
    const { paymentIntentId, shippingInfo, cartItems, totalAmount } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, error: 'Payment not completed' });
    }

    // Create order in database (you can create an Order schema)
    const orderData = {
      userId: req.user.id,
      paymentIntentId: paymentIntentId,
      items: cartItems,
      shippingInfo: shippingInfo,
      totalAmount: totalAmount,
      status: 'confirmed',
      createdAt: new Date(),
      paymentStatus: 'paid'
    };

    // For now, we'll just log the order (you can save to database)
    console.log('Order created:', orderData);

    // Clear user's cart after successful payment
    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartItems: [] }
    );

    res.json({
      success: true,
      message: 'Payment confirmed and order created',
      orderId: paymentIntentId // Using payment intent ID as order ID for now
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm payment' });
  }
});

// Get payment status
app.get('/payment-status/:paymentIntentId', fetchuser, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert back from cents
      currency: paymentIntent.currency
    });
    
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ success: false, error: 'Failed to get payment status' });
  }
});

app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
