const connection = require('../../database/connection');

let notify = {
    welcome: {
        title: "Bem Vindo.",
        type: 1,
        message: "Bem vindo a nossa plataforma de leilão."
    },
    newVendor: {
        title: "Novo Vendedor.",
        type: 2,
        message: "Agora você pode cadastrar produtos para leilão em nossa plataforma."
    },
    userBid: {
        title: "Lance realizado",
        type: 3,
        message: "Você fez um lance no produto x."
    },
    vendorBid: {
        title: "Seu produto recebeu um lance.",
        type: 4,
        message: "Fizeram um lance no valor x em seu x produto."
    },
    completeCad: {
        title: "Cadastro incompleto.",
        type: 4,
        message: "Complete seu cadastro para ter acesso a todas as funções da plataforma."
    },
};


async function saveNotify(type, idUser) {
    const query = 'INSERT INTO user_notification (id_user, type, title, message) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        connection.query(query, [idUser, notify[type].type, notify[type].title, notify[type].message], (error, results) => {
            if (error) {
                console.error('Erro inserir notificação:', error);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

module.exports = { saveNotify };
