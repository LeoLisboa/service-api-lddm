const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

router.post('/', async (req, res) => {

    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    const userData = getUserFromToken(token);
    
    if (!userData) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    if (!userData.id) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
    }

    const { id_product, price, percentage } = req.body;

    try {
        const query = 'INSERT INTO product_bid (id_product, id_user_bid, price, percentage, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
        connection.query(query, [id_product, userData.id, price, percentage], (error, results) => {
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