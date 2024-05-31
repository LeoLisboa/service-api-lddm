const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para obter um produto específico
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        const query = `
            SELECT p.*, ps.status AS status_string, GROUP_CONCAT(pi.url) AS images
            FROM product p
            JOIN product_status ps ON p.status = ps.id
            LEFT JOIN product_image pi ON p.id = pi.id_product
            WHERE p.id = ?
            GROUP BY p.id, ps.status
        `;
        
        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Erro ao buscar produto do banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: "Produto não encontrado" });
            }
            
            // Convert the images field from a comma-separated string to an array
            const produto = results[0];
            produto.images = produto.images ? produto.images.split(',') : [];
            
            return res.status(200).json({ produto });
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
