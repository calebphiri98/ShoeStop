const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// In a full production app, you would add an auth middleware here
// e.g., router.post('/', protect, orderController.createOrder);

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders); // Usually protected for Admin

module.exports = router;