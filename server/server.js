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
// Credentials come from environment variables set on Render (and in your local .env file).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 ASSET UPLOAD ENGINE PIPELINE Configuration
// Files are streamed directly to Cloudinary instead of the local disk, so they
// persist across Render restarts/redeploys (the previous local 'uploads/' folder
// was wiped every time the service restarted, since Render's filesystem is ephemeral).
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoestop-products', // assets are organized under this folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Configure upload parameter filters
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit data matrix stream transfers to 5MB max
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

// 🔌 Dedicated POST Endpoint matching Frontend Form formatting stream
app.post('/api/products/upload', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file detected within multi-part boundary configuration.' });
    }

    // req.file.path is the secure Cloudinary URL when using CloudinaryStorage
    const generatedUrl = req.file.path;

    // Return both formats to perfectly satisfy frontend data assignment expectations
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

// Global Error Handler for file upload size failures or invalid format configurations
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
// const path = require('path');
// const fs = require('fs');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());



// // 📦 ASSET UPLOAD ENGINE PIPELINE Configuration
// // Ensure the physical 'uploads' folder directory exists to prevent startup stream write failures
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Setup local storage destination disk engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     // Generate an optimized timestamped file string layout
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // Configure upload parameter filters
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit data matrix stream transfers to 5MB max
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|webp/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Asset upload engine strictly requires image formatting files.'));
//     }
//   }
// });

// // Expose the upload folder directory publicly over HTTP routing
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // 🔌 Dedicated POST Endpoint matching Frontend Form formatting stream
// // FIXED: path now matches frontend call ('/api/products/upload'), and handler
// // signature corrected to (req, res, next) — it was (req, file, res), which made
// // every res.status()/res.json() call below silently target the wrong object.
// app.post('/api/products/upload', upload.single('image'), (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No media file detected within multi-part boundary configuration.' });
//     }
    
//     // Construct absolute public link resolution layout
//     const serverUrl = `${req.protocol}://${req.get('host')}`;
//     const generatedUrl = `${serverUrl}/uploads/${req.file.filename}`;
    
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
// // const express = require('express');
// // const cors = require('cors');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // require('dotenv').config();

// // const app = express();

// // // Middleware
// // app.use(cors());
// // app.use(express.json());



// // // 📦 ASSET UPLOAD ENGINE PIPELINE Configuration
// // // Ensure the physical 'uploads' folder directory exists to prevent startup stream write failures
// // const uploadDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadDir)) {
// //   fs.mkdirSync(uploadDir);
// // }

// // // Setup local storage destination disk engine
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/');
// //   },
// //   filename: (req, file, cb) => {
// //     // Generate an optimized timestamped file string layout
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
// //     cb(null, uniqueSuffix + path.extname(file.originalname));
// //   }
// // });

// // // Configure upload parameter filters
// // const upload = multer({
// //   storage: storage,
// //   limits: { fileSize: 5 * 1024 * 1024 }, // Limit data matrix stream transfers to 5MB max
// //   fileFilter: (req, file, cb) => {
// //     const filetypes = /jpeg|jpg|png|webp/;
// //     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// //     const mimetype = filetypes.test(file.mimetype);

// //     if (mimetype && extname) {
// //       return cb(null, true);
// //     } else {
// //       cb(new Error('Asset upload engine strictly requires image formatting files.'));
// //     }
// //   }
// // });

// // // Expose the upload folder directory publicly over HTTP routing
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // // 🔌 Dedicated POST Endpoint matching Frontend Form formatting stream
// // app.post('/api/upload', upload.single('image'), (req, file, res) => {
// //   try {
// //     if (!req.file) {
// //       return res.status(400).json({ error: 'No media file detected within multi-part boundary configuration.' });
// //     }
    
// //     // Construct absolute public link resolution layout
// //     const serverUrl = `${req.protocol}://${req.get('host')}`;
// //     const generatedUrl = `${serverUrl}/uploads/${req.file.filename}`;
    
// //     // Return both formats to perfectly satisfy frontend data assignment expectations
// //     res.status(200).json({ 
// //       url: generatedUrl,
// //       image_url: generatedUrl 
// //     });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });


// // // Base App Routes
// // app.use('/api/products', require('./routes/productRoutes'));
// // app.use('/api/users', require('./routes/userRoutes'));
// // app.use('/api/orders', require('./routes/orderRoutes'));

// // // Global Error Handler for file upload size failures or invalid format configurations
// // app.use((err, req, res, next) => {
// //   if (err instanceof multer.MulterError) {
// //     return res.status(400).json({ error: `Multer transaction rejected: ${err.message}` });
// //   } else if (err) {
// //     return res.status(400).json({ error: err.message });
// //   }
// //   next();
// // });

// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => {
// //   console.log(`ShoeStop Server running on port ${PORT}`);
// // });
