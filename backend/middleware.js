const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); // Assuming you have JWT setup

const secretKey = 'd1acb9602970513209590380d15c33f42a7728d9395c775bc571c9d6bc49850c';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.sendStatus(403);
        
        req.userId = decoded.userId;
        console.log('> Verified.')
        next();
    });
};

module.exports = {
    corsMiddleware: cors(),
    bodyParserMiddleware: bodyParser.json(),
    verifyToken
};