const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const getHeaderToken = require('../getHeaderToken');

// Rota para obter um produto específico
router.get('/', getHeaderToken, async (req, res) => {
    const userData = req.user;
    try {

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
            p.id_user = ?
        GROUP BY 
            p.id, 
            pb.price, 
            pb.created_at, 
            pb.updated_at, 
            pb.id_user_bid, 
            pb.percentage;
        `;

        connection.query(query, [userData.id], (error, results) => {
            if (error) {
                console.error('Erro ao buscar produto do banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Produto não encontrado" });
            }

            // Objeto temporário para armazenar os produtos com lances agrupados
            const produtosAgrupados = {};

            // Iterar sobre os resultados da consulta
            results.forEach(row => {
                const productId = row.id;

                // Verificar se o produto já está no objeto produtosAgrupados
                if (!produtosAgrupados[productId]) {
                    // Se não estiver, inicializar o objeto para esse produto
                    produtosAgrupados[productId] = {
                        id: row.id,
                        name: row.name,
                        desc: row.desc,
                        start_price: row.start_price,
                        final_bid_price: row.final_bid_price,
                        current_price: row.current_price,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        status_name: row.status_name,
                        images: row.images ? row.images.split(',') : [],
                        history_bid: []
                    };
                }

                // Adicionar o histórico de lance ao produto correspondente
                produtosAgrupados[productId].history_bid.push({
                    price: row.price,
                    percentage: row.percentage,
                    bid_created_at: row.bid_created_at,
                    bid_updated_at: row.bid_updated_at
                });
            });

            // Converter o objeto em um array de produtos
            const produtos = Object.values(produtosAgrupados);

            return res.status(200).json({ produtos });
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
