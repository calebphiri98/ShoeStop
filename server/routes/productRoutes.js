const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Bring in your multer instance to intercept the incoming media streams
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Catalog Base Core Routes
router.get('/', productController.getProducts);
router.post('/', productController.createProduct); 
router.patch('/:id', productController.updateProductPrice); 

// ⚡ Dynamic Asset Upload Routing Route - Intercepts 'image' file matching frontend FormData key name
router.post('/upload', upload.single('image'), productController.uploadProductImage);

// 🗑️ Active Entry Purge Route - Destroys item matching key target constraints
router.delete('/:id', productController.deleteProductEntry);

module.exports = router;

