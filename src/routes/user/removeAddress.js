const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');

// Rota para atualizar o status do user_address com base no ID
router.put('/:id', async (req, res) => {
    const addressId = req.params.id;

    try {
        const query = 'UPDATE user_address SET status = 0 WHERE id = ?';
        connection.query(query, [addressId], (error, results) => {
            if (error) {
                console.error('Erro ao remover o endereço do usuário:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Endereço não encontrado" });
            }
            return res.status(200).json({ message: "Endereço removido com sucesso" });
        });
    } catch (error) {
        console.error('Erro ao atualizar o status do endereço:', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
