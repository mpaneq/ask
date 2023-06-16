const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db_client = require('./app/db');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use(require('./app/order/controller'));

app.get("/health", async (req, res) => {
    let qres = await db_client.query('SELECT NOW()');
    return res.status(200).send({ status: "ok", time: qres.rows[0].now });
});

app.use(require('./app/error_handler'));

const port = 8080;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
