import session from 'express-session';

// Configure session middleware with MemoryStore
const sessionConfig = session({
  secret: 'your-secret-key', // Replace with a strong, unique secret
  resave: false, // Prevent saving session if it wasn't modified
  saveUninitialized: false, // Don't save empty sessions
  store: new session.MemoryStore(), // Use MemoryStore for session storage
  cookie: {
    secure: false, // Set `true` if using HTTPS
    httpOnly: true, // Prevent client-side JavaScript access to the cookie
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration in milliseconds (1 day)
    sameSite: 'strict', // Helps prevent CSRF attacks
  },
});

export default sessionConfig;
