const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

router.get('/:email', async (req, res) => {
    const email = req.params.email;

    const emailQuery = 'SELECT * FROM customer WHERE email = ?';
    connection.query(emailQuery, [email], (emailError, emailResults) => {
        if (emailError) {
            console.error('Erro ao verificar e-mail no banco de dados:', emailError);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        if (emailResults.length > 0) {
            return res.status(200).json({ message: "E-mail já está em uso" });
        }

        return res.status(404).json({ message: "E-mail não está em uso"});
    });
});

module.exports = router;