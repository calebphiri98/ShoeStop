const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Maps directly to GET /api/products
router.get('/', productController.getProducts);

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');

// // Route mapping for getting filtered/sorted products
// router.get('/', productController.getProducts);

// module.exports = router;
