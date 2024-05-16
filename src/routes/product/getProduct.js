const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para obter um único produto com todas as informações
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const query = 'SELECT * FROM product WHERE id = ?';
        connection.query(query, [productId], (error, results) => {
            if (error) {
                console.error('Erro ao buscar produto do banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Produto não encontrado" });
            }
            return res.status(200).json({ produto: results[0] });
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;