const connection = require('../../database/connection');
const { promisify } = require('util');

const queryAsync = promisify(connection.query).bind(connection);

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
        // }
    },
    vendorBid: {
        title: "Seu produto recebeu um lance.",
        type: 5,
        message: "Fizeram um lance no name_produto no valor de price_produto.",
        // addons: {
        //     id_product: 0,
        // }
    },
    anotherUserBid: {
        title: "Corra para não perder",
        type: 6,
        message: "Outro usuário ofertou no seu produto, corra antes que o leilão acabe.",
        // addons: {
        //     id_product: 0,
        // }
    },
};


async function saveNotify(type, idUser) {
    const query = 'INSERT INTO user_notification (id_user, type, title, message) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        connection.query(query, [idUser, notify[type].type, notify[type].title, notify[type].message], (error, results) => {
            if (error) {
                console.error('Erro ao inserir notificação:', error);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function saveNotifyWithAddons(type, idUser, addons) {
    let productResult = {}
    try {
        const querySelectProdcut = 'SELECT name, current_price FROM product WHERE id = (?)';
        productResult = await queryAsync(querySelectProdcut, [addons.id_product]);
    } catch (error) {
        console.error(error)
    }

    try {
        let message = notify[type].message
            .replace('name_produto', productResult[0].name)
            .replace('price_produto', productResult[0].current_price);

        const insertNotify = 'INSERT INTO user_notification (id_user, type, title, message, addons) VALUES (?, ?, ?, ?, ?)';
        await queryAsync(insertNotify, [idUser, notify[type].type, notify[type].title, message, JSON.stringify(addons)]);
    } catch (error) {
        console.error(error)
    }

    return true
}

module.exports = { saveNotify, saveNotifyWithAddons };

