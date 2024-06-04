const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');
const { saveNotify } = require('../notify/createNotify');

router.post('/', getHeaderToken, async (req, res) => {
    const userData = req.user;

    if (!userData || !userData.id) {
        return res.status(400).json({ message: "Token inválido ou usuário não encontrado." });
    }

    const userId = userData.id;

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

        await queryDatabase('UPDATE user SET status = 2 WHERE id = ?', [userId]);
        await saveNotify('newVendor', userId);

        return res.status(200).json({ message: "Status do usuário atualizado com sucesso." });
    } catch (error) {
        console.error('Erro ao atualizar o status do usuário:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
