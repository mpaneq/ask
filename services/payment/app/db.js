const _ = require("lodash");

const config = {
    envs: {
        host: "DB_HOST",
        port: "DB_PORT",
        user: "DB_USER",
        pass: "DB_PASSWORD",
        db: "DB_NAME"
    }
};
_.values(config.envs).forEach(e => {
    if (!process.env[e])
        throw {
            message: "Environment variable " + e + " must be specified on startup."
        }
});

const { Pool } = require('pg');
 
const pool = new Pool({
    host: process.env[config.envs.host],
    port: process.env[config.envs.port],
    user: process.env[config.envs.user],
    password: process.env[config.envs.pass],
    database: process.env[config.envs.db]
});

connect();

function connect() {
    pool
        .connect()
        .then(() => console.log('Successfully connected to database'))
        .catch((err) => {
            console.error("Cannot connect to the database", err);
        });
}

module.exports = pool;