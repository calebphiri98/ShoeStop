
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

// CRITICAL FIX: Ensure this exact sub-path maps directly to updateOrderStatus
router.patch('/:id/status', orderController.updateOrderStatus); 

module.exports = router;