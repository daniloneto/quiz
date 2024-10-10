const fileUpload = require('express-fileupload');

const fileUploadMiddleware = fileUpload();

module.exports = fileUploadMiddleware;