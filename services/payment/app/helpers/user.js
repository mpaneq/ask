const _ = require("lodash");

async function findById(client, id) {
    function validateId(value) {
        if (typeof value === "string") {
            if (!/^\d+$/.test(value))
                throw {
                    message: "id must only contain digits"
                };
            return parseInt(value);
        }

        if (typeof value === "number") {
            if (!Number.isInteger(value))
                throw {
                    message: "id must be integer"
                };
            return value;
        }

        throw {
            message: "id must be either a number or its string representation"
        };
    }

    function convert(user) {
        user.balance = 
            typeof user.balance === "string" ? 
            parseFloat(user.balance) :
            user.balance;
        return user;
    }

    try {
        id = validateId(id);
    } catch (err) {
        throw {
            type: "user_invalid_id",
            message: err.message || err
        }
    }

    let qres = await client.query("SELECT * FROM public.user WHERE id=" + id);
    if (!qres.rows.length)
        throw {
            type: "user_does_not_exist"
        }
    
    return convert(qres.rows[0]);
}

async function addMoney(client, id, amount) {
    let user = await findById(client, id);
    await client.query("UPDATE public.user SET balance = '" + (user.balance + amount) + "' WHERE id = " + user.id);
}

async function substractMoney(client, id, amount) {
    let user = await findById(client, id);
    if (user.balance < amount)
        throw {
            type: "insufficient_balance"
        }
    await client.query("UPDATE public.user SET balance = '" + (user.balance - amount) + "' WHERE id = " + user.id);
}

module.exports = { findById, addMoney, substractMoney };