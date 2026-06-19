const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ☁️ CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 ASSET UPLOAD ENGINE PIPELINE Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoestop-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Asset upload engine strictly requires image formatting files.'));
    }
  }
});

// Dedicated POST Upload Endpoint
app.post('/api/products/upload', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file detected within multi-part boundary configuration.' });
    }

    const generatedUrl = req.file.path;

    res.status(200).json({
      url: generatedUrl,
      image_url: generatedUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Base App Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer transaction rejected: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ShoeStop Server running on port ${PORT}`);
});
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const { v2: cloudinary } = require('cloudinary');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ☁️ CLOUDINARY CONFIGURATION
// // Credentials come from environment variables set on Render (and in your local .env file).
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 📦 ASSET UPLOAD ENGINE PIPELINE Configuration
// // Files are streamed directly to Cloudinary instead of the local disk, so they
// // persist across Render restarts/redeploys (the previous local 'uploads/' folder
// // was wiped every time the service restarted, since Render's filesystem is ephemeral).
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'shoestop-products', // assets are organized under this folder in your Cloudinary account
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//   },
// });

// // Configure upload parameter filters
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit data matrix stream transfers to 5MB max
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|webp/;
//     const extname = filetypes.test(file.originalname.toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Asset upload engine strictly requires image formatting files.'));
//     }
//   }
// });

// // 🔌 Dedicated POST Endpoint matching Frontend Form formatting stream
// app.post('/api/products/upload', upload.single('image'), (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No media file detected within multi-part boundary configuration.' });
//     }

//     // req.file.path is the secure Cloudinary URL when using CloudinaryStorage
//     const generatedUrl = req.file.path;

//     // Return both formats to perfectly satisfy frontend data assignment expectations
//     res.status(200).json({
//       url: generatedUrl,
//       image_url: generatedUrl
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // Base App Routes
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));

// // Global Error Handler for file upload size failures or invalid format configurations
// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ error: `Multer transaction rejected: ${err.message}` });
//   } else if (err) {
//     return res.status(400).json({ error: err.message });
//   }
//   next();
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`ShoeStop Server running on port ${PORT}`);
// });