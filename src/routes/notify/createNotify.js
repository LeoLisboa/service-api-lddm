const connection = require('../../database/connection');

let notify = {
    welcome: {
        title: "Bem Vindo.",
        type: 1,
        message: "Bem vindo a nossa plataforma de leilão."
    },
    completeCad: {
        title: "Cadastro incompleto.",
        type: 2,
        message: "Complete seu cadastro para ter acesso a todas as funções da plataforma."
    },
    newVendor: {
        title: "Novo Vendedor.",
        type: 3,
        message: "Agora você pode cadastrar produtos para leilão em nossa plataforma."
    },

    // with addons

    userBid: {
        title: "Lance realizado",
        type: 4,
        message: "Você fez um lance no produto name_produto no valor de price_produto",
        // addons: {
        //     id_product: 0,
        //     name_produto: 0,
        //     price_produto: 0
        // }
    },
    vendorBid: {
        title: "Seu produto recebeu um lance.",
        type: 5,
        message: "Fizeram um lance no name_produto no valor de price_produto.",
        
    },
    anotherUserBid: {
        title: "Corra para não perder",
        type: 5,
        message: "Outro usuário ofertou no seu produto, corra antes que o leilão acabe.",
    },
};


async function saveNotify(type, idUser, addons) {
    const query = 'INSERT INTO user_notification (id_user, type, title, message, addons) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        connection.query(query, [idUser, notify[type].type, notify[type].title, notify[type].message, (addons != null) ? addons : null], (error, results) => {
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
