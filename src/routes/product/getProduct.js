const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para obter produtos
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (id === 'all') {
            // Query para obter todos os produtos
            const queryAll = `
                SELECT p.*, ps.status AS status_string, GROUP_CONCAT(pi.url) AS images
                FROM product p
                JOIN product_status ps ON p.status = ps.id
                LEFT JOIN product_image pi ON p.id = pi.id_product
                GROUP BY p.id, ps.status
            `;
            connection.query(queryAll, (error, results) => {
                if (error) {
                    console.error('Erro ao buscar produtos do banco de dados:', error);
                    return res.status(500).json({ message: "Erro no servidor" });
                }
                return res.status(200).json({ produtos: results });
            });
        } else {
            // Query para obter um único produto
            const productId = parseInt(id, 10);
            const querySingle = `
                SELECT p.*, ps.status AS status_string, GROUP_CONCAT(pi.url) AS images
                FROM product p
                JOIN product_status ps ON p.status = ps.id
                LEFT JOIN product_image pi ON p.id = pi.id_product
                WHERE p.id = ?
                GROUP BY p.id, ps.status
            `;
            connection.query(querySingle, [productId], (error, results) => {
                if (error) {
                    console.error('Erro ao buscar produto do banco de dados:', error);
                    return res.status(500).json({ message: "Erro no servidor" });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: "Produto não encontrado" });
                }
                return res.status(200).json({ produto: results[0] });
            });
        }
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
