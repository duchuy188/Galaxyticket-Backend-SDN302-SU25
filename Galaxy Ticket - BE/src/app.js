require('./models');  

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger/swagger');
const swaggerAuth = require('./middlewares/swaggerAuth.middleware');



const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Thêm các domain của frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middlewares

app.use(cors(corsOptions));
app.use(morgan('dev'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic route
app.get("/", (req, res) => {
  res.send("Galaxy Ticket API is running...");
});


app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/approval-requests', require('./routes/approvalRequestRoutes'));
// app.use('/api/theaters', require('./routes/theaterRoutes')); // Thêm sau khi làm theater
    
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.use('/api/seats', require('./routes/seatRoutes'));

// Routes will be added here
app.use("/api/auth", require("./routes/auth.route"));
// app.use('/api/movies', require('./routes/movie.route'));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});


module.exports = app;  

