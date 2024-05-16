const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../../database/connection');
const { generateToken } = require('../jwUtils');

router.post('/', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM user WHERE email = ?';

    connection.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuário do banco de dados:', error);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        // Gerar token JWT
        const token = generateToken(user);

        return res.status(200).json({ token });
    });
});

module.exports = router;
