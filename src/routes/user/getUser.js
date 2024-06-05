const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');

// Use o middleware de autenticação para a rota de usuário
router.get('/', getHeaderToken, (req, res) => {
    const userData = req.user;

    const query = `
        SELECT u.*, 
               a.id AS address_id, a.cep, a.number, a.complement, a.reference, a.status AS address_status, a.created_at AS address_created_at, a.updated_at AS address_updated_at
        FROM user u
        LEFT JOIN user_address a ON u.id = a.id_user
        WHERE u.id = ?
    `;

    connection.query(query, [userData.id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuário do banco de dados:', error);
            return res.status(500).json({ message: "Erro no servidor" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const user = {
            id: results[0].id,
            name: results[0].name,
            perfil_url: results[0].perfil_url,
            email: results[0].email,
            cpf: results[0].cpf,
            phone: results[0].phone,
            birthdate: results[0].birthdate,
            status: results[0].status,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at,
            addresses: []
        };

        results.forEach(result => {
            if (result.address_id && result.address_status == 1) {
                user.addresses.push({
                    id: result.address_id,
                    cep: result.cep,
                    number: result.number,
                    complement: result.complement,
                    reference: result.reference,
                    created_at: result.address_created_at,
                    updated_at: result.address_updated_at
                });
            }
        });

        return res.status(200).json({ user });
    });
});

module.exports = router;
