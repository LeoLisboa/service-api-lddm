const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');

// Use o middleware de autenticação para a rota de usuário
router.get('/', getHeaderToken, (req, res) => {
    const userData = req.user;

    const query = 'SELECT * FROM user_notification WHERE id_user = ? ORDER BY id DESC';

    connection.query(query, [userData.id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar produto do banco de dados:', error);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        let notifications = results

        return res.status(200).json({ notifications });
    });
});

router.get('/quant', getHeaderToken, (req, res) => {
    const userData = req.user;

    const query = 'SELECT COUNT(*) AS notificationCount FROM user_notification WHERE id_user = ? ';

    connection.query(query, [userData.id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar notificações do banco de dados:', error);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        const notificationCount = results[0].notificationCount;

        return res.status(200).json({ notificationCount });
    });
});


module.exports = router;
