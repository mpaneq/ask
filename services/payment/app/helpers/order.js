const _ = require("lodash");

const Item = require("./item");
const User = require("./user");

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

    try {
        id = validateId(id);
    } catch (err) {
        throw {
            type: "order_invalid_id",
            message: err.message || err
        }
    }

    let qres = await client.query("SELECT * FROM public.order WHERE id=" + id); 
    if (!qres.rows.length)
        throw {
            type: "order_does_not_exist"
        }
    
    return qres.rows[0];
}

async function getOrderContent(client, id) {
    let order = await findById(client, id);
    let qres = await client.query("SELECT * FROM public.order_content WHERE order_id=" + order.id);
    
    let content = await Promise.all(qres.rows.map(async el => {
        el.item = await Item.findById(client, el.item_id);
        return _.pick(el, ["item", "quantity"]);
    }));

    return content;
}

async function getSum(client, id) {
    let content = await getOrderContent(client, id);
    return content.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
}

async function removePurchasedItems(client, id) {
    let content = await getOrderContent(client, id);
    await Promise.all(content.map(async c => {
        await Item.reduceQuantityBy(client, c.item.id, c.quantity);
    }));
}

async function addMoneyToSellers(client, id) {
    let content = await getOrderContent(client, id);
    await Promise.all(content.map(async c => {
        await User.addMoney(client, c.item.owner_id, c.item.price * c.quantity);
    }));
}

async function substractMoneyFromBuyer(client, id) {
    let order = await findById(client, id);
    await User.substractMoney(client, order.user_id, await getSum(client, id));
}

async function setPaid(client, id) {
    let order = await findById(client, id);
    if (order.paid) 
        throw {
            type: "order_already_paid"
        }
    await client.query("UPDATE public.order SET paid = 'true' WHERE id = " + order.id);
}

module.exports = { findById, getSum, removePurchasedItems, addMoneyToSellers, substractMoneyFromBuyer, setPaid, getOrderContent };