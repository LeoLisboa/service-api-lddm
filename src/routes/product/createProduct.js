const express = require('express');
const router = express.Router();
const connection = require('../../database/connection');
const azure = require('azure-storage')
const { v1: uuidv1 } = require('uuid');
const { getUserFromToken } = require('../jwUtils');

router.post('/', async (req, res) => {
    let token = (req.headers.authorization != '') ? req.headers.authorization.split(' ')[1] : false
    let dataUser = getUserFromToken(token);

    if (!token || !dataUser) {
        return res.status(401).json({ message: "Token não fornecido, inválido ou expirado" });
    }

    let { name, price, desc, grading, winning_bid_price, imageBase64 } = req.body;

    let fileName = uuidv1() + `.png`;
    let fileUrl = `https://ftplddm.blob.core.windows.net/sftp/${fileName}`

    try {
        const query = 'INSERT INTO product (id_user, name , price, `desc`, grading, winning_bid_price, img_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [dataUser.id, name, price, desc, grading, winning_bid_price, fileUrl], (error, results) => {
            if (error) {
                console.error('Erro ao registrar usuário no banco de dados:', error);
                return res.status(500).json({ message: "Erro no servidor" });
            }
            console.log('produto criado com sucesso')
        });
    } catch (error) {
        console.error('Erro no servidor', error);
        return res.status(500).json({ message: "Erro no servidor" });
    }

    const blobSvc = azure.createBlobService("DefaultEndpointsProtocol=https;AccountName=ftplddm;AccountKey=7GADGSaAeNiVnIuEWdbHI1Go87695aN1zCpkZz1CMaapjK8+aqj5d8XFI33u8Ot3Lhy3OKM/QV5d+ASthqYCvw==;EndpointSuffix=core.windows.net");

    let buffer = Buffer.from(imageBase64, 'base64')

    blobSvc.createBlockBlobFromText('sftp', fileName, buffer, {
        contentType: 'image/png'
    }, function (error, result, response) {
        if (error) {
            fileName = 'default.png'
        }
    });

    return res.status(201).json({ message: "Produto registrado com sucesso" });
});

module.exports = router;