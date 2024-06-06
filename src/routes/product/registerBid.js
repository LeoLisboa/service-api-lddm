const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');
const { saveNotifyWithAddons } = require('../notify/createNotify');

router.post('/', getHeaderToken, async (req, res) => {
    const userData = req.user;
    const { id_product, price } = req.body;
    let last_bid_user_id;

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
        const insertBidResult = await queryDatabase(
            'INSERT INTO product_bid (id_product, id_user_bid, price) VALUES (?, ?, ?)',
            [id_product, userData.id, price]
        );

        const productResults = await queryDatabase(
            'SELECT id_user FROM product WHERE id = ?',
            [id_product]
        );
        if (productResults.length > 0) {
            vendor_id = productResults[0].id_user;
        }

        // Enviar notificações
        await saveNotifyWithAddons('userBid', userData.id, { id_product: id_product });

        if (last_bid_user_id && last_bid_user_id != userData.id) {
            await saveNotifyWithAddons('anotherUserBid', last_bid_user_id, { id_product: id_product });
        }

        await saveNotifyWithAddons('vendorBid', vendor_id, { id_product: id_product });

        return res.status(201).json({ message: "Lance registrado com sucesso" });
    } catch (error) {
        console.error('Erro ao processar o lance:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

router.post('/finish', getHeaderToken, async (req, res) => {
    const userData = req.user;
    const { id_product } = req.body;
    let last_bid_user_id;
    let vendor_id;

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

        // Atualizar o status do produto para 2
        await queryDatabase(
            'UPDATE product SET status = 2 WHERE id = ?',
            [id_product]
        );

        // Obter o id_user do produto e o valor de final_bid_price
        const productResults = await queryDatabase(
            'SELECT id_user, final_bid_price FROM product WHERE id = ?',
            [id_product]
        );
        let final_bid_price;
        if (productResults.length > 0) {
            vendor_id = productResults[0].id_user;
            final_bid_price = productResults[0].final_bid_price;
        }

        // Criar um novo lance na tabela product_bid com o final_bid_price
        await queryDatabase(
            'INSERT INTO product_bid (id_product, id_user_bid, price) VALUES (?, ?, ?)',
            [id_product, userData.id, final_bid_price]
        );

        // Enviar notificações
        await saveNotifyWithAddons('finishBidUser', userData.id, { id_product: id_product });

        if (last_bid_user_id && last_bid_user_id != userData.id) {
            await saveNotifyWithAddons('finishAnotherUserBid', last_bid_user_id, { id_product: id_product });
        }

        await saveNotifyWithAddons('finishBidVendor', vendor_id, { id_product: id_product });

        return res.status(201).json({ message: "Lance registrado com sucesso" });
    } catch (error) {
        console.error('Erro ao processar o lance:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;