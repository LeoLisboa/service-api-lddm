const jwt = require('jsonwebtoken');
const JWT_SECRET = "diogoDefante";

function generateToken(user) {
    return jwt.sign({ 
        id: user.id,
    },
        JWT_SECRET,
        { expiresIn: '1d' } // Expira em um dia
    );
}

function getUserFromToken(token) {
    try {
        const tokenData = jwt.verify(token, JWT_SECRET);
        const userData = {
            id: tokenData.id,
        };
        return userData;
    } catch (error) {
        return null;
    }
}

module.exports = { generateToken, getUserFromToken };
