const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para obter todos os produtos
router.get('/', async (req, res) => {
    try {
        const query = `SELECT p.*, GROUP_CONCAT(pi.url) AS images, ps.status AS status_name 
                        FROM product p 
                        JOIN product_status ps ON p.status = ps.id
                        LEFT JOIN product_image pi ON (p.id = pi.id_product) 
                        WHERE p.status = 1
                        GROUP BY p.id; 
        `;
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erro ao buscar produtos do banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            
            // Convert the images field from a comma-separated string to an array for each product
            results.forEach(result => {
                result.images = result.images ? result.images.split(',') : [];
            });

            return res.status(200).json({ produtos: results });
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
