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

// 3. Update Order Details & Quantities
exports.updateOrder = async (req, res) => {
  const { id } = req.params; 
  const { shippingAddress, whatsappNumber, items } = req.body; 

  const orderIdParsed = parseInt(id, 10);
  if (isNaN(orderIdParsed)) {
    return res.status(400).json({ 
      error: `Invalid or uninitialized Order ID received in route params. Got: "${id}"` 
    });
  }

  try {
    await db.query('BEGIN');

    // Update general shipping/contact details
    const orderCheck = await db.query(
      `UPDATE orders 
       SET shipping_address = $1, whatsapp_number = $2 
       WHERE id = $3 RETURNING id`,
      [shippingAddress, whatsappNumber, orderIdParsed]
    );

    if (orderCheck.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Order profile targeting not found' });
    }

    // Loop and update nested line-item quantities safely
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemIdParsed = parseInt(item.item_id, 10);
        if (isNaN(itemIdParsed)) {
          await db.query('ROLLBACK');
          return res.status(400).json({
            error: `Invalid or missing item_id inside items array payload. Ensure your frontend sends 'item_id'. Received: "${item.item_id}"`,
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


// const db = require('../config/db');

// // 1. Create a new order (Checkout)
// exports.createOrder = async (req, res) => {
//   const { userId, totalAmount, shippingAddress, whatsappNumber, cartItems } = req.body;

//   try {
//     await db.query('BEGIN');

//     const orderResult = await db.query(
//       'INSERT INTO orders (user_id, total_amount, shipping_address, whatsapp_number) VALUES ($1, $2, $3, $4) RETURNING id',
//       [userId || null, totalAmount, shippingAddress, whatsappNumber]
//     );
    
//     const orderId = orderResult.rows[0].id;

//     for (const item of cartItems) {
//       await db.query(
//         'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, size, color) VALUES ($1, $2, $3, $4, $5, $6)',
//         [orderId, item.id, item.quantity || 1, item.price, item.size || null, item.color || null]
//       );
//     }

//     await db.query('COMMIT');
//     res.status(201).json({ message: 'Order created successfully', orderId });
//   } catch (error) {
//     await db.query('ROLLBACK');
//     console.error('Order Creation Error:', error);
//     res.status(500).json({ error: 'Server error creating order' });
//   }
// };

// // 2. Get all orders with nested items
// exports.getAllOrders = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT 
//         o.id,
//         o.user_id,
//         o.total_amount,
//         o.status,
//         o.shipping_address,
//         o.whatsapp_number,
//         o.created_at,
//         u.name AS customer_name,
//         COALESCE(
//           json_agg(
//             json_build_object(
//               'item_id', oi.id,
//               'product_id', oi.product_id,
//               'product_name', p.name,
//               'quantity', oi.quantity,
//               'price_at_time', oi.price_at_time,
//               'size', oi.size,
//               'color', oi.color
//             )
//           ) FILTER (WHERE oi.id IS NOT NULL), '[]'
//         ) AS items
//       FROM orders o
//       LEFT JOIN users u ON o.user_id = u.id
//       LEFT JOIN order_items oi ON o.id = oi.order_id
//       LEFT JOIN products p ON oi.product_id = p.id
//       GROUP BY o.id, u.name
//       ORDER BY o.created_at DESC
//     `);

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ error: 'Server error fetching orders' });
//   }
// };

// // 3. Update Order Details & Quantities (Defensive validation against "undefined" inputs)
// // 3. Update Order Details & Quantities (Defensive validation against "undefined" inputs)
// exports.updateOrder = async (req, res) => {
//   const { id } = req.params; // Order ID from URL path params
//   const { shippingAddress, whatsappNumber, items } = req.body; // items: [{ item_id, quantity }]

//   // FAIL FAST: Validate parent order ID before hitting the database
//   const orderIdParsed = parseInt(id, 10);
//   if (isNaN(orderIdParsed)) {
//     return res.status(400).json({ 
//       error: `Invalid or uninitialized Order ID received in route params. Got: "${id}"` 
//     });
//   }

//   try {
//     await db.query('BEGIN');

//     // Update general shipping/contact details
//     const orderCheck = await db.query(
//       `UPDATE orders 
//        SET shipping_address = $1, whatsapp_number = $2 
//        WHERE id = $3 RETURNING id`,
//       [shippingAddress, whatsappNumber, orderIdParsed]
//     );

//     if (orderCheck.rows.length === 0) {
//       await db.query('ROLLBACK');
//       return res.status(404).json({ error: 'Order profile targeting not found' });
//     }

//     // Loop and update nested line-item quantities safely
//     if (items && Array.isArray(items)) {
//       for (const item of items) {
//         // FAIL FAST: Validate specific item_id row entry configuration
//         const itemIdParsed = parseInt(item.item_id, 10);
//         if (isNaN(itemIdParsed)) {
//           await db.query('ROLLBACK');
//           return res.status(400).json({
//             error: `Invalid or missing item_id inside items array payload. Ensure your frontend sends 'item_id'. Received: "${item.item_id}"`,
//             offendingItem: item
//           });
//         }

//         const qty = parseInt(item.quantity, 10) || 0;

//         if (qty <= 0) {
//           // Cleanly remove specific item variant if quantity falls to 0
//           await db.query(
//             'DELETE FROM order_items WHERE id = $1 AND order_id = $2',
//             [itemIdParsed, orderIdParsed]
//           );
//         } else {
//           // Modify quantity row configuration safely without bleeding into separate variants
//           await db.query(
//             'UPDATE order_items SET quantity = $1 WHERE id = $2 AND order_id = $3',
//             [qty, itemIdParsed, orderIdParsed]
//           );
//         }
//       }
//     }

//     // Automatically recalculate total_amount based on remaining items & historical pricing
//     const totalResult = await db.query(
//       'SELECT SUM(quantity * price_at_time) as dynamic_total FROM order_items WHERE order_id = $1',
//       [orderIdParsed]
//     );
    
//     const baseTotal = parseFloat(totalResult.rows[0].dynamic_total || 0);

//     if (baseTotal === 0) {
//       // Cleanly clear out the parent order if all items are down to 0
//       await db.query('DELETE FROM orders WHERE id = $1', [orderIdParsed]);
//       await db.query('COMMIT');
//       return res.status(200).json({ message: 'All items removed. Order cancelled completely.' });
//     }

//     // Maintain flat shipping fee logic ($15 flat fee example if items remain)
//     const finalTotal = baseTotal + 15;

//     // Save calculated amount back to parent schema
//     const updatedOrderRecord = await db.query(
//       'UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *',
//       [finalTotal, orderIdParsed]
//     );

//     await db.query('COMMIT');

//     res.status(200).json({ 
//       message: 'Items and balance recalculations synchronized.', 
//       order: updatedOrderRecord.rows[0] 
//     });
//   } catch (error) {
//     await db.query('ROLLBACK');
//     console.error('Error modifying order items:', error);
//     res.status(500).json({ error: 'Server error updating quantity metrics' });
//   }
// };


// // 4. Cancel / Delete Order (Safe Cascade Guarantee)
// exports.deleteOrder = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await db.query('BEGIN');

//     // FIXED: Manually clean up child records first to circumvent foreign key constraints violations
//     await db.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
//     // Clean up parent record
//     const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

//     if (result.rows.length === 0) {
//       await db.query('ROLLBACK');
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     await db.query('COMMIT');
//     res.status(200).json({ message: 'Order cancelled and deleted successfully' });
//   } catch (error) {
//     await db.query('ROLLBACK');
//     console.error('Error deleting order:', error);
//     res.status(500).json({ error: 'Server error cancelling order' });
//   }
// };
