const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../../database/connection');
const { saveNotify } = require('../notify/createNotify');

router.post('/', async (req, res) => {
    const {name, email, phone, birthdate, password} = req.body;

    let idUser = 0;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO user (name, email, phone, birthdate, password) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [name, email, phone, birthdate, hashedPassword], async (error, results) => {
            if (error) {
                console.error('Erro ao registrar usuário no banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            idUser = results.insertId;
            await saveNotify('welcome', idUser, null)
            await saveNotify('completeCad', idUser, null)
            return res.status(201).json({ message: "Usuário registrado com sucesso" });
        });
    } catch (error) {
        console.error('Erro ao criptografar a senha:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }


});

module.exports = router;