const express = require('express');
const router = express.Router();
const getHeaderToken = require('../getHeaderToken');
const connection = require('../../database/connection');

// Rota para adicionar um endereço ao usuário
router.post('/', getHeaderToken, (req, res) => {
    const userData = req.user;
    try {

        const { cep, number, complement, reference } = req.body;

        if (!cep || !number || !complement || !reference) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        const query = `
            INSERT INTO user_address (id_user, cep, number, complement, reference)
            VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(query, [userData.id, cep, number, complement, reference], (error, results) => {
            if (error) {
                console.error('Erro ao adicionar endereço no banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            return res.status(201).json({ message: "Endereço adicionado com sucesso" });
        });
    } catch (error) {
        console.error('Erro no servidor', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
