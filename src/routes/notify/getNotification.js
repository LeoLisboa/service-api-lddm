const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');

// Use o middleware de autenticação para a rota de usuário
router.get('/', getHeaderToken, (req, res) => {
    const userData = req.user;

    const query = 'SELECT * FROM user_notification WHERE id_user = ?';

    connection.query(query, [userData.id], async (error, results) => {
        if (error) {
            console.error('Erro ao buscar notificações do banco de dados:', error);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        // Array para armazenar as promessas de atualização das notificações no banco
        const updatePromises = [];

        // Iterar sobre as notificações para substituir os placeholders
        for (let i = 0; i < results.length; i++) {
            const notification = results[i];
            const type = notification.type;
            const addons = JSON.parse(notification.addons);

            // Se o tipo for 4 (userBid) ou 5 (vendorBid ou anotherUserBid)
            if (type === 4 || type === 5) {
                // Obter informações do lance com base no ID fornecido nos addons
                const bidQuery = 'SELECT id_product, price FROM product_bid WHERE id = ?';
                const bidId = addons.id_bid;

                connection.query(bidQuery, [bidId], (bidErr, bidResults) => {
                    if (bidErr) {
                        console.error('Erro ao buscar informações do lance:', bidErr);
                        return;
                    }

                    // Verificar se foi encontrado um lance com o ID fornecido
                    if (bidResults.length > 0) {
                        const productId = bidResults[0].id_product;
                        const price = bidResults[0].price;

                        // Obter informações do produto com base no ID do produto associado ao lance
                        const productQuery = 'SELECT name FROM product WHERE id = ?';

                        connection.query(productQuery, [productId], (productErr, productResults) => {
                            if (productErr) {
                                console.error('Erro ao buscar informações do produto:', productErr);
                                return;
                            }

                            // Substituir placeholders
                            if (productResults.length > 0) {
                                const productName = productResults[0].name;
                                const message = notification.message
                                    .replace('name_produto', productName)
                                    .replace('price_produto', price);

                                // Atualizar a notificação com as informações do produto
                                results[i].message = message;

                                // Criar a promessa para atualizar a notificação no banco
                                const updatePromise = new Promise((resolve, reject) => {
                                    const updateQuery = 'UPDATE user_notification SET message = ? WHERE id = ?';
                                    connection.query(updateQuery, [message, notification.id], (updateErr, updateResults) => {
                                        if (updateErr) {
                                            console.error('Erro ao atualizar a notificação no banco:', updateErr);
                                            reject(updateErr);
                                        } else {
                                            resolve(updateResults);
                                        }
                                    });
                                });

                                // Adicionar a promessa ao array de promessas de atualização
                                updatePromises.push(updatePromise);
                            }
                        });
                    }
                });
            }
        }


        // Aguardar a conclusão de todas as promessas de atualização
        try {
            await Promise.all(updatePromises);
        } catch (updateError) {
            console.error('Erro ao atualizar notificações no banco:', updateError);
            return res.status(500).json({ message: "Erro ao atualizar notificações no banco de dados" });
        }

        return res.status(200).json({ notifications: results });
    });
});

module.exports = router;
