const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const Admin = require('./routes/Admin');
const Subscribe = require('./routes/Subscribe');
const Contact = require('./routes/Contact');
const upcomingevent = require('./routes/Upcomingevents');


const app = express();


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// CORS configuration for allowing any origin but with credentials
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(passport.initialize());




// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', Admin);
app.use('/subscribe', Subscribe);
app.use('/contact', Contact);
app.use('/upcomingevent', upcomingevent);

app.get("/", (req, res) => {
  return res.status(200).send({ message: 'Hello from Co-Createlabs Backend' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
