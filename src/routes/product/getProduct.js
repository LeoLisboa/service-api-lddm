const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para obter um produto específico
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const query = `
        SELECT 
        p.*, 
        p.created_at AS product_created_at,
        p.updated_at AS product_updated_at,
        pb.id_user_bid, 
        pb.price, 
        pb.percentage, 
        pb.created_at AS bid_created_at, 
        pb.updated_at AS bid_updated_at, 
        GROUP_CONCAT(pi.url) AS images, 
        ps.status AS status_name
        FROM 
            product p 
        JOIN 
            product_status ps ON p.status = ps.id
        LEFT JOIN 
            product_image pi ON p.id = pi.id_product
        LEFT JOIN 
            product_bid pb ON p.id = pb.id_product 
        WHERE 
            p.id = ?
        GROUP BY 
            p.id, 
            pb.price, 
            pb.created_at, 
            pb.updated_at, 
            pb.id_user_bid, 
            pb.percentage;
        `;

        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Erro ao buscar produto do banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Produto não encontrado" });
            }

            // Initialize the product object
            const produto = {
                id: results[0].id,
                name: results[0].name,
                desc: results[0].desc,
                start_price: results[0].start_price,
                final_bid_price: results[0].final_bid_price,
                current_price: results[0].current_price,
                created_at: results[0].product_created_at,
                updated_at: results[0].product_updated_at,
                status_name: results[0].status_name,
                images: results[0].images ? results[0].images.split(',') : []
            };

            produto.history_bid = results
                .map(row => ({
                    id_user_bid: row.id_user_bid,
                    price: row.price,
                    percentage: row.percentage,
                    bid_created_at: row.bid_created_at,
                    bid_updated_at: row.bid_updated_at
                }))
                .filter(bid => bid.id_user_bid) // Filter out any rows where id_user_bid is null
                .sort((a, b) => b.price - a.price); // Sort by price in descending order

            return res.status(200).json({ produto });
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;