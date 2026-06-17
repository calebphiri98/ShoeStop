const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// In a full production app, you would add an auth middleware here
// e.g., router.post('/', protect, orderController.createOrder);

// 1. Create Order: POST /api/orders
router.post('/', orderController.createOrder);

// 2. Get Orders: GET /api/orders
router.get('/', orderController.getAllOrders); 

// 3. Update Order Details/Qty: PUT /api/orders/:id  <-- WAS MISSING
router.put('/:id', orderController.updateOrder);

// 4. Cancel/Delete Order: DELETE /api/orders/:id    <-- WAS MISSING
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
