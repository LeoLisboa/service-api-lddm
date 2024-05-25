const express = require('express');
const router = express.Router();
const { getUserFromToken } = require('../jwUtils');

router.get('/', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido ou Inválido"});
    }

    const userData = getUserFromToken(token);

    if (!userData) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    // Aqui você pode usar os dados do usuário obtidos do token, por exemplo:
    // const userId = userData.id;
    // const userName = userData.name;

    return res.status(200).json({ user: userData });
});

module.exports = router;