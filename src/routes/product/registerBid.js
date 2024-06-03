const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');
const { saveNotify } = require('../notify/createNotify');

router.post('/', getHeaderToken, async (req, res) => {
    const userData = req.user;
    const { id_product, price } = req.body;
    let last_bid_user_id;

    // Função para realizar uma query ao banco de dados e retornar uma Promise
    const queryDatabase = (query, params) => {
        return new Promise((resolve, reject) => {
            connection.query(query, params, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };

    try {
        // Primeira consulta para obter o último id_user_bid
        const results = await queryDatabase(
            'SELECT id_user_bid FROM product_bid WHERE id_product = ? ORDER BY id DESC LIMIT 1',
            [id_product]
        );
        if (results.length > 0) {
            last_bid_user_id = results[0].id_user_bid;
        }

        // Segunda consulta para inserir um novo lance
        await queryDatabase(
            'INSERT INTO product_bid (id_product, id_user_bid, price) VALUES (?, ?, ?)',
            [id_product, userData.id, price]
        );

        // Enviar notificações
        await saveNotify('userBid', userData.id, id_product);
        if (last_bid_user_id) {
            await saveNotify('anotherUserBid', last_bid_user_id, id_product);
        }

        return res.status(201).json({ message: "Lance registrado com sucesso" });
    } catch (error) {
        console.error('Erro ao processar o lance:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
