const express = require('express');
const nodemailer = require('nodemailer');
const emailValidator = require('email-validator');

const router = express.Router();

function genCode() {
    return Math.floor(1000 + Math.random() * 9000);
}

router.get('/email/:user_email', (req, res) => {

    const user_email = req.params.user_email;

    let code = genCode();

    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'jellytronic.store@gmail.com',
            pass: 'bfad zynx qfko khtj',
        },
    });

    transport.sendMail({
        from: 'jellytronic.store@gmail.com',
        to: user_email,
        subject: 'Código de Verificação',
        html: `Não compartilhe o código de verificação: </br> <Strong> ${code} </Strong>`
    })
        .then((response) => {
            console.log(response)
            return res.status(200).json({ code: code });
        })
        .catch((err) => {
            return res.status(500).json({ message: "Ocorreu um erro ao enviar o e-mail." });
        });

});

module.exports = router;