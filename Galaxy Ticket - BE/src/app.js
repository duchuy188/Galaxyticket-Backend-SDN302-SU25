const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger/swagger');
const swaggerAuth = require('./middlewares/swaggerAuth.middleware'); 
const screeningRoutes = require('./routes/screeningRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic route
app.get('/', (req, res) => {
    res.send('Galaxy Ticket API is running...');
});

app.use('/api/movies', require('./routes/movieRoutes'));
// app.use('/api/theaters', require('./routes/theaterRoutes')); // Thêm sau khi làm theater
app.use('/api/screenings', screeningRoutes);
app.use('/', screeningRoutes);
// ... existing code ...
app.use('/api/rooms', require('./routes/roomRoutes'));
// ... existing code ...

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

module.exports = app;  
