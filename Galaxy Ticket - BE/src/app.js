const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger/swagger');
const swaggerAuth = require('./middlewares/swaggerAuth.middleware'); 

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

// Routes will be added here
// app.use('/api/auth', require('./routes/auth.route'));
// app.use('/api/movies', require('./routes/movie.route'));
// etc...

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

module.exports = app;  
