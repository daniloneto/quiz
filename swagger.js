const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const optionsV1 = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Quiz API',
            version: '1.0.0',
        },
    },
    apis: ['./routes/v1/*.js'], 
};

const specsV1 = swaggerJsdoc(optionsV1);

module.exports = {
    swaggerUi,
    specsV1
};
