const db = require('../config/db');

// Fetch all products with filtering and sorting
exports.getProducts = async (req, res) => {
  try {
    const { category, gender, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    // Filter by Category if provided
    if (category) {
      query += ` AND category = $${valueIndex}`;
      values.push(category);
      valueIndex++;
    }

    // Filter by Gender (Capitalizes first letter to match 'Men', 'Women', 'Unisex')
    if (gender && gender.toLowerCase() !== 'all') {
      const formattedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      query += ` AND gender = $${valueIndex}`;
      values.push(formattedGender);
      valueIndex++;
    }

    // Sorting Logic
    if (sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else {
      query += ' ORDER BY created_at DESC'; // Default fallback: Newest stock first
    }

    const { rows } = await db.query(query, values);
    
    // Always return a clean HTTP 200 array response
    res.status(200).json(rows);
  } catch (error) {
    // Crucial terminal tracking: look here in your backend logs if a 500 error triggers!
    console.error('Error fetching products from database:', error);
    res.status(500).json({ error: 'Server error fetching products from inventory database' });
  }
};
