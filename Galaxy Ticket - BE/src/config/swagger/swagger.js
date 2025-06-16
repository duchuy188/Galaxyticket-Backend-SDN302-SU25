const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Galaxy Ticket API Documentation',
      version: '1.0.0',
      description: 'API documentation for Galaxy Ticket booking system',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://galaxyticket-backend-sdn302-su25.onrender.com'  
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local development server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/config/swagger/schemas/*.js',
    './src/config/swagger/apis/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions
};