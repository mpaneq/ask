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

    function convert(item) {
        item.price = 
            typeof item.price === "string" ? 
            parseFloat(item.price) :
            item.price;
        return item;
    }

    try {
        id = validateId(id);
    } catch (err) {
        throw {
            type: "item_invalid_id",
            message: err.message || err
        }
    }

    let qres = await client.query("SELECT * FROM public.item WHERE id=" + id);
    if (!qres.rows.length)
        throw {
            type: "item_does_not_exist"
        }
    
    return convert(qres.rows[0]);
}

async function reduceQuantityBy(client, id, amount) {
    let item = await findById(client, id);
    if (item.quantity < amount)
        throw {
            type: "not_enough_items"
        }
    await client.query("UPDATE public.item SET quantity = '" + (item.quantity - amount) + "' WHERE id = " + item.id);
}

module.exports = { findById, reduceQuantityBy };