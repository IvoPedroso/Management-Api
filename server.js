const app = require('./config/express')();
const cors = require('cors');
const port = app.get('port');

app.use(cors());
// Iniciar aplicação.
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`)
});

