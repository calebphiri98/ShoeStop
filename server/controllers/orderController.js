const db = require('../config/db');

// Create a new order (Checkout)
exports.createOrder = async (req, res) => {
  const { userId, totalAmount, shippingAddress, whatsappNumber, cartItems } = req.body;

  try {
    // Start a database transaction
    await db.query('BEGIN');

    // 1. Insert Order
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, whatsapp_number) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId || null, totalAmount, shippingAddress, whatsappNumber]
    );
    
    const orderId = orderResult.rows[0].id;

    // 2. Insert Order Items
    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, size, color) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.id, item.quantity || 1, item.price, item.size || null, item.color || null]
      );
    }

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('Order Creation Error:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
};

// Get all orders (For Admin Dashboard)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT orders.*, users.name as customer_name 
      FROM orders 
      LEFT JOIN users ON orders.user_id = users.id 
      ORDER BY orders.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
};
