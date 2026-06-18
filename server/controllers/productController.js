const db = require('../config/db');

// 1. Fetch all products with filtering and sorting
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
    console.error('Error fetching products from database:', error);
    res.status(500).json({ error: 'Server error fetching products from inventory database' });
  }
};

// 2. Create a new product entry (Fixed to handle both images arrays and image_url fallbacks)
exports.createProduct = async (req, res) => {
  const { name, price, images, image_url, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Product name and valuation price are required fields.' });
  }

  try {
    // Generate an automated URL-safe unique slug from the product title name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Strip out custom symbols or punctuation structural marks
      .trim()
      .replace(/\s+/g, '-');        // Replace spaces with dash structures
    
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    // Safely structure images: accept incoming images array, fallback to array-wrapped image_url, or placeholder
    let imageAssetArray = ['https://via.placeholder.com/150'];
    if (images && Array.isArray(images) && images.length > 0) {
      imageAssetArray = images;
    } else if (image_url) {
      imageAssetArray = [image_url];
    }
    
    // Set explicit default parameters for missing schema values
    const stockFallback = 12; 
    
    // Fallback to 'Men' if category not provided to align with store navigation metrics
    const finalCategory = category || 'Men'; 
    const defaultGender = finalCategory; // Align gender attribute node with store category filter matches

    const query = `
      INSERT INTO products (name, slug, price, images, category, stock_quantity, gender) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`;
      
    const values = [
      name, 
      uniqueSlug, 
      Number(price), 
      imageAssetArray, 
      finalCategory, 
      stockFallback,
      defaultGender
    ];
    
    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error injecting product entry:', error);
    res.status(500).json({ error: 'Server error registering product entry into inventory.' });
  }
};

// 3. Update an existing product's pricing model parameters
exports.updateProductPrice = async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  const cleanId = typeof id === 'string' ? id.replace('#', '') : id;
  const productId = parseInt(cleanId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: `Invalid product ID reference parameter: "${id}"` });
  }

  if (price === undefined || isNaN(price)) {
    return res.status(400).json({ error: 'A valid numeric pricing value parameter is required.' });
  }

  try {
    const query = 'UPDATE products SET price = $1 WHERE id = $2 RETURNING *';
    const { rows } = await db.query(query, [Number(price), productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product profile matrix targeting not found.' });
    }

    res.status(200).json({
      message: 'Product valuation parameters successfully updated.',
      product: rows[0]
    });
  } catch (error) {
    console.error('Error modifying product validation price:', error);
    res.status(500).json({ error: 'Server error modifying product inventory matrix.' });
  }
};

// ⚡ 4. New Controller Method: Process parsed asset upload data streams back to React layout
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file detected within multi-part boundary configuration.' });
    }
    
    // Resolve clean absolute addressable public links pointing to local express server mapping
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const generatedUrl = `${serverUrl}/uploads/${req.file.filename}`;
    
    // Return both variations to easily satisfy frontend assignment configurations
    return res.status(200).json({ 
      url: generatedUrl,
      image_url: generatedUrl 
    });
  } catch (err) {
    console.error('Asset upload engine failure:', err);
    return res.status(500).json({ error: 'Server error generating static asset link endpoints.' });
  }
};
// Append this at the very bottom of your productController.js file

// 5. Permanently remove a target product entry from inventory matching structural parameters
exports.deleteProductEntry = async (req, res) => {
  const { id } = req.params;
  
  // Clean up routing structures if custom ID symbols slip through
  const cleanId = typeof id === 'string' ? id.replace('#', '') : id;
  const productId = parseInt(cleanId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: `Invalid product ID reference parameter: "${id}"` });
  }

  try {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product profile entry not identified within catalog repository.' });
    }

    return res.status(200).json({
      message: 'Product listing successfully expunged from repository.',
      deletedProduct: rows[0]
    });
  } catch (error) {
    console.error('Database product deletion exception:', error);
    return res.status(500).json({ error: 'Server error processing product deletion from inventory.' });
  }
};
