const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb+srv://championcharith:Charith%402005@cluster.irrf2v6.mongodb.net/ecommerce")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Root route
app.get("/", (req, res) => {
  res.send("Express is running");
});

// ✅ Image storage setup with multer
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    // ❗ Fixed backtick string syntax
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// ✅ Serve static images from '/upload/images'
app.use('/images', express.static('upload/images'));

// ✅ Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});


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
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});


//add product
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length>0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id+1;
  }
  else
  { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({success:true,name:req.body.name})
});


//remove product
app.post("/removeproduct", async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({success:true,name:req.body.name})
});

//get all products
app.get("/allproducts", async (req, res) => {
	let products = await Product.find({});
  console.log("All Products");
    res.send(products);
});ī

// ✅ Start server
app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is running on port " + port);
  }
});