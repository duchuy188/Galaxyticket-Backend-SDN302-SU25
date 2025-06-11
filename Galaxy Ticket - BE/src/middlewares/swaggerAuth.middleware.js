const basicAuth = require('express-basic-auth');

const swaggerAuth = basicAuth({
    users: { 
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD 
    },
    challenge: true,
    realm: 'Galaxy-Ticket-API-Docs',
});

module.exports = swaggerAuth;