const db = require('../config/db');

// Fetch all products with filtering and sorting
exports.getProducts = async (req, res) => {
  try {
    const { category, gender, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    if (category) {
      query += ` AND category = $${valueIndex}`;
      values.push(category);
      valueIndex++;
    }

    if (gender) {
      query += ` AND gender = $${valueIndex}`;
      values.push(gender);
      valueIndex++;
    }

    // Sorting logic
    if (sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else query += ' ORDER BY created_at DESC'; // Default: Newest

    const { rows } = await db.query(query, values);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
};
