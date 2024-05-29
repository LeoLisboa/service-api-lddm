const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para obter todos os produtos
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, ps.status AS status_string, GROUP_CONCAT(pi.url) AS images
            FROM product p
            JOIN product_status ps ON p.status = ps.id
            LEFT JOIN product_image pi ON p.id = pi.id_product
            GROUP BY p.id, ps.status
        `;
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erro ao buscar produtos do banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            return res.status(200).json({ produtos: results });
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
