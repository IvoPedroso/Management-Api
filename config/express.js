const express    = require('express');
const bodyParser = require('body-parser');
const config     = require('config');
const consign    = require('consign')

module.exports = () => {
  const app = express();

  // Definir variáveis da aplicação.
  app.set('port', process.env.MANAGEMENT_API_PORT || config.get('server.port'));
  app.set('version', '1.0.0');

  // Adicionar middlewares.
  app.use(bodyParser.json());

  // Endpoints
  consign({cwd:'api'})
    .then('controllers')
    .then('routes')
    .into(app);

  return app;
};