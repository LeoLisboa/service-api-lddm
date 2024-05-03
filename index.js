const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 8080;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use(morgan('dev'));

app.get('/', (req, res, next) => {
  res.send("API FATEC OSASCO | LDDM | LEILÃO");
});

const registerRoute = require('./src/routes/register');
app.use('/register', registerRoute);

const loginRoute = require('./src/routes/login');
app.use('/login', loginRoute);

const checkEmail = require('./src/routes/checkEmail');
app.use('/checkEmail', checkEmail);

const checkPhone = require('./src/routes/checkPhone');
app.use('/checkPhone', checkPhone);

app.use((req, res, next) => {
  const error = new Error('A rota solicitada não existe');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.json({
    error: {
      message: error.message
    }
  });
});

// Inicie o servidor na porta especificada

app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});
