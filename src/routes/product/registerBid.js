const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');

router.post('/', getHeaderToken, (req, res) => {
    const userData = req.user;

    const { id_product, price } = req.body;

    try {
        const query = 'INSERT INTO product_bid (id_product, id_user_bid, price) VALUES (?, ?, ?)';
        connection.query(query, [id_product, userData.id, price], (error, results) => {
            if (error) {
                console.error('Erro ao registrar lance no banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            return res.status(201).json({ message: "Lance registrado com sucesso" });
        });
    } catch (error) {
        console.error('Erro ao processar o lance:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;