const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

router.get('/:phone', async (req, res) => {
    const phone = req.params.phone;

    const phoneQuery = 'SELECT * FROM customer WHERE phone = ?';
    connection.query(phoneQuery, [phone], (phoneError, phoneResults) => {
        if (phoneError) {
            console.error('Erro ao verificar número de telefone no banco de dados:', phoneError);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        if (phoneResults.length > 0) {
            return res.status(200).json({ message: "Número de telefone já está em uso" });
        }

        return res.status(404).json({ message: "Número de telefone não está em uso"});
    });
});

module.exports = router;