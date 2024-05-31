const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getUserFromToken } = require('../jwUtils');
const connection = require('../../database/connection');

router.put('/', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const updatesData = req.body; // Dados recebidos do corpo da requisição
    
    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    const userData = getUserFromToken(token);
    
    if (!userData) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    if (!userData.id) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
    }

    // Primeiro, obtenha os nomes das colunas da tabela 'user'
    connection.query('SHOW COLUMNS FROM user', async (err, columns) => {
        if (err) {
            console.error('Erro ao obter colunas do banco de dados:', err);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        const columnMap = new Map(columns.map(column => [column.Field, column.Type]));
        let query = 'UPDATE user SET ';
        let updates = [];
        let params = [];
        let updatedFields = {};
        let invalidFields = {};

        if (updatesData.id) {
            invalidFields['id'] = 'O id não pode ser modificado.';    
            delete updatesData.id;
        }

        for (const [key, value] of Object.entries(updatesData)) {
            if (columnMap.has(key)) {
                const columnType = columnMap.get(key);
                if (validateType(value, columnType)) {
                    if (key === 'password') {
                        const hashedPassword = await bcrypt.hash(value, 10);
                        updates.push('password = ?');
                        params.push(hashedPassword);
                    } else {
                        updates.push(`${key} = ?`);
                        params.push(value);
                    }
                    updatedFields[key] = value;
                } else {
                    invalidFields[key] = 'formato inválido';
                }
            } else {
                invalidFields[key] = 'chave inválida';
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "Nenhum campo válido para atualizar." });
        }

        query += updates.join(', ');
        query += ' WHERE id = ?';
        params.push(userData.id);

        connection.query(query, params, (error, results) => {
            if (error) {
                console.error('Erro ao atualizar usuário no banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor." });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }
            return res.status(200).json({ 
                message: "Usuário atualizado com sucesso.", 
                updatedFields: updatedFields, 
                invalidFields: invalidFields 
            });
        });
    });
});

function validateType(value, columnType) {
    // Remove parênteses de tamanho, se houver
    const type = columnType.split('(')[0].toLowerCase();
    if (type === 'int') {
        return Number.isInteger(value);
    } else if (type === 'varchar' || type === 'text') {
        return typeof value === 'string';
    } else if (type === 'decimal' || type === 'float' || type === 'double') {
        return typeof value === 'number';
    } else {
        return false; // Tipo não suportado
    }
}

module.exports = router;
