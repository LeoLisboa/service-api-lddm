const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const { getUserFromToken } = require('../jwUtils');
const { saveImageAzure } = require('../Image');
const { promisify } = require('util');

const queryAsync = promisify(connection.query).bind(connection);

router.post('/', async (req, res) => {
    let token = (req.headers.authorization != '') ? req.headers.authorization.split(' ')[1] : false;
    let dataUser = getUserFromToken(token);

    if (!token || !dataUser) {
        return res.status(401).json({ message: "Token não fornecido, inválido ou expirado" });
    }

    let { name, desc, start_price, final_bid_price, grading, imageBase64 } = req.body;
    let fileUrl = await saveImageAzure(imageBase64);

    try {
        const insertProductQuery = 'INSERT INTO product (id_user, name , `desc`, final_bid_price, grading, start_price, current_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const productResult = await queryAsync(insertProductQuery, [dataUser.id, name, desc, final_bid_price, grading, start_price, start_price, 0]);
        
        const idProduct = productResult.insertId;

        const insertImageQuery = 'INSERT INTO product_image (id_product, url) VALUES (?, ?)';
        await queryAsync(insertImageQuery, [idProduct, fileUrl]);

        return res.status(201).json({ message: "Produto registrado com sucesso", productId: idProduct });
    } catch (error) {
        console.error('Erro no servidor', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
});

module.exports = router;
