const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 1. Create Order: POST /api/orders
router.post('/', orderController.createOrder);

// 2. Get Orders: GET /api/orders
router.get('/', orderController.getAllOrders); 

// 3. Update Order Details/Qty/Status: PUT /api/orders/:id
router.put('/:id', orderController.updateOrder);

// 4. Explicit Status Update Target: PATCH /api/orders/:id/status
router.patch('/:id/status', orderController.updateOrderStatus);

// 5. Cancel/Delete Order: DELETE /api/orders/:id
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
