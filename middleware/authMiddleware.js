// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get token from the HTTP header
  const authHeader = req.header('Authorization');

  // Check if no header or doesn't start with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 2. Extract the actual token string out of "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // 3. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded user ID to the request object
    req.user = decoded.userId;
    
    // Move on to the actual route logic
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

module.exports = authMiddleware;