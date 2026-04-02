const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDB } = require('./db');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Generic Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await initDB();
    console.log('SQLite DB initialized');
    
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
