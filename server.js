const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const Admin=require('./routes/Admin');



const corsOptions = (req, callback) => {
  let corsOptions;

  // Allow requests with credentials
  corsOptions = {
    origin: req.header('Origin'), // Reflect the request origin
    credentials: true, // This allows the server to accept cookies and authentication
  };

  callback(null, corsOptions); // Callback expects two parameters: error and options
};



const app = express();
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

  app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(passport.initialize());


// Configure the session middleware
app.use(session({
  secret: process.env.APP_SECRET, // Replace with a real secret key
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', Admin);

app.get("/",(req,res)=>{
  return res.status(200).send({ message: 'Hollo from Co-Createlabs' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
