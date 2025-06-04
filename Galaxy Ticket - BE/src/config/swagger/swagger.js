const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Galaxy Ticket API Documentation',
      version: '1.0.0',
      description: 'API documentation for Galaxy Ticket booking system',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/config/swagger/schemas/*.js',
    './src/config/swagger/apis/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;