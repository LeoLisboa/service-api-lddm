const { getUserFromToken } = require('./jwUtils');

const getHeaderToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido ou inválido" });
    }

    const userData = getUserFromToken(token);

    if (!userData) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    req.user = userData;
    next();
};

module.exports = getHeaderToken;
