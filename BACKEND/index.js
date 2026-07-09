require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Server listen
app.listen(PORT, () => {
  console.log(`ResearchMind AI Backend running on port ${PORT}`);
});
