const express = require('express');
const router = express.Router();
const { getUserFromToken } = require('../jwUtils');
const connection = require('../../database/connection');

router.get('/', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido ou Inválido"});
    }

    const userData = getUserFromToken(token);

    if (!userData) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    const query = 'SELECT * FROM user WHERE id = ?';
''
    connection.query(query, [userData.id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuário do banco de dados:', error);
            return res.status(500).json({ message: "Erro no servidor" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        return res.status(200).json({ user: results[0] });
    });
});

module.exports = router;