const db = require('../config/db');

// 1. Create a new order (Checkout)
exports.createOrder = async (req, res) => {
  const { userId, totalAmount, shippingAddress, whatsappNumber, cartItems } = req.body;

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cannot create an empty order. cartItems array is required.' });
  }

  try {
    await db.query('BEGIN');

    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, whatsapp_number) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId || null, totalAmount, shippingAddress, whatsappNumber]
    );
    
    const orderId = orderResult.rows[0].id;

    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, size, color) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.id, item.quantity || 1, item.price, item.size || null, item.color || null]
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Order Creation Error:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
};

// 2. Get all orders with nested items
exports.getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.whatsapp_number,
        o.created_at,
        u.name AS customer_name,
        COALESCE(
          json_agg(
            json_build_object(
              'item_id', oi.id,
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'price_at_time', oi.price_at_time,
              'size', oi.size,
              'color', oi.color
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
};

// 3. Update Order Details, Status, & Quantities (Polymorphic Handler)
exports.updateOrder = async (req, res) => {
  const { id } = req.params; 
  const { shippingAddress, whatsappNumber, items, status } = req.body; 

  const orderIdParsed = parseInt(id, 10);
  if (isNaN(orderIdParsed)) {
    return res.status(400).json({ 
      error: `Invalid or uninitialized Order ID received in route params. Got: "${id}"` 
    });
  }

  try {
    await db.query('BEGIN');

    // --- INTERACTION PATTERN A: Admin Dashboard Status Router Interception ---
    if (status !== undefined) {
      const statusCheck = await db.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderIdParsed]
      );

      if (statusCheck.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Order profile targeting not found to update status' });
      }

      // If ONLY changing status, bypass calculation blocks completely for performance safety
      if (!items && !shippingAddress && !whatsappNumber) {
        await db.query('COMMIT');
        return res.status(200).json({ 
          message: 'Order tracking state updated successfully.', 
          order: statusCheck.rows[0] 
        });
      }
    }

    // --- INTERACTION PATTERN B: Shipping Profile details mutations ---
    if (shippingAddress !== undefined || whatsappNumber !== undefined) {
      const orderCheck = await db.query(
        `UPDATE orders 
         SET shipping_address = COALESCE($1, shipping_address), 
             whatsapp_number = COALESCE($2, whatsapp_number) 
         WHERE id = $3 RETURNING id`,
        [shippingAddress || null, whatsappNumber || null, orderIdParsed]
      );

      if (orderCheck.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Order profile targeting not found' });
      }
    }

    // Loop and update nested line-item quantities safely
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemIdParsed = parseInt(item.item_id, 10);
        if (isNaN(itemIdParsed)) {
          await db.query('ROLLBACK');
          return res.status(400).json({
            error: `Invalid or missing item_id inside items array payload. Received: "${item.item_id}"`,
            offendingItem: item
          });
        }

        const qty = parseInt(item.quantity, 10) || 0;

        if (qty <= 0) {
          await db.query(
            'DELETE FROM order_items WHERE id = $1 AND order_id = $2',
            [itemIdParsed, orderIdParsed]
          );
        } else {
          await db.query(
            'UPDATE order_items SET quantity = $1 WHERE id = $2 AND order_id = $3',
            [qty, itemIdParsed, orderIdParsed]
          );
        }
      }
    }

    // Automatically recalculate total_amount based on remaining items & historical pricing
    const totalResult = await db.query(
      'SELECT SUM(quantity * price_at_time) as dynamic_total FROM order_items WHERE order_id = $1',
      [orderIdParsed]
    );
    
    const baseTotal = parseFloat(totalResult.rows[0].dynamic_total || 0);

    if (baseTotal === 0) {
      await db.query('DELETE FROM orders WHERE id = $1', [orderIdParsed]);
      await db.query('COMMIT');
      return res.status(200).json({ message: 'All items removed. Order cancelled completely.' });
    }

    // Maintain flat shipping fee logic ($15 flat fee example if items remain)
    const finalTotal = baseTotal + 15;

    // Save calculated amount back to parent schema
    const updatedOrderRecord = await db.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *',
      [finalTotal, orderIdParsed]
    );

    await db.query('COMMIT');

    res.status(200).json({ 
      message: 'Items and balance recalculations synchronized.', 
      order: updatedOrderRecord.rows[0] 
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error modifying order items:', error);
    res.status(500).json({ error: 'Server error updating quantity metrics' });
  }
};

// 4. Cancel / Delete Order (Safe Cascade Guarantee)
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.query('COMMIT');
    res.status(200).json({ message: 'Order cancelled and deleted successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Server error cancelling order' });
  }
};

// 5. Update Order Status (Explicit Isolation Target - Sanitized)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  // Strip out prefixing '#' formatting structures if they seep into route metrics
  const cleanId = typeof id === 'string' ? id.replace('#', '') : id;
  const orderId = parseInt(cleanId, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ error: `Invalid order ID value received: "${id}"` });
  }

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status', allowedStatuses });
  }

  try {
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order profile matrix targeting not found' });
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Status Update Error:', error);
    return res.status(500).json({ error: 'Server error updating order status' });
  }
};
