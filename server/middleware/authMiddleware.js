const jwt = require('jsonwebtoken');

exports.protectAdmin = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // In a real app, you would fetch the user from Neon DB here to verify role
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized as an admin' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};
