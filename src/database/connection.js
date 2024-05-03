// database/connection.js

const mysql = require('mysql');

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'apidbsql.mysql.database.azure.com', // host do seu banco de dados
    user: 'apiuserdb', // usuário do banco de dados
    password: 'u$er@zureDB', // senha do banco de dados
    database: 'lddm_api' // nome do banco de dados
});

// Conectar ao banco de dados
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados');
});

module.exports = connection;
