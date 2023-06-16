const db_client_pool = require("../db");
const _ = require("lodash");

//this serves as a protection againts SQL injection
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
        message: "id must be either a number or it's string representation"
    };
}

async function findById(entity, id) {
    try {
        id = validateId(id);
    } catch (err) {
        throw {
            type: `${entity}_invalid_id`,
            message: err.message || err
        }
    }

    const client = await db_client_pool.connect();
    let qres = await client.query(`SELECT * FROM public.${entity} WHERE id = ${id}`); 
    client.release();

    if (!qres.rows.length)
        throw {
            type: `${entity}_does_not_exist`
        }
    return qres.rows[0];
}

async function expandOrderContent(order) {
    const client = await db_client_pool.connect();
    let qres = await client.query(`SELECT * FROM public.order_content WHERE order_id=${order.id}`);
    client.release();

    order.content = await Promise.all(qres.rows.map(async row => {
        let item = await findById("item", row.item_id);
        item.price = parseFloat(item.price);
        return {
            item,
            quantity: row.quantity
        };
    }));
    return order;
}

async function findUnpaidOrder(user_id) {
    let user = await findById("user", user_id);

    const client = await db_client_pool.connect();
    let qres = await client.query("SELECT * FROM public.order WHERE paid = 'false' AND user_id = " + user.id);
    client.release();

    return qres.rows.length ? expandOrderContent(qres.rows[0]) : null;
}

async function createUnpaidOrder(user_id) {
    let order = await findUnpaidOrder(user_id);
    if (order)
        throw {
            type: "order_already_exists"
        }

    const client = await db_client_pool.connect();
    await client.query(`INSERT INTO public.order (user_id, paid) VALUES (${user_id}, 'false')`);
    client.release();

    return await findUnpaidOrder(user_id);
}

async function addItemToOrder(order_id, item_id, quantity = 1) {
    let order = await findById("order", order_id);
    let item = await findById("item", item_id);

    if (order.paid)
        throw {
            type: "order_already_paid"
        }

    try {
        quantity = validatePosInt(quantity);
    } catch (e) {
        throw {
            type: "invalid_quantity"
        }
    }

    const client = await db_client_pool.connect();
    let qres = await client.query(`SELECT * FROM public.order_content WHERE order_id=${order.id} AND item_id=${item.id}`);
    if (qres.rows.length) {
        let current_quantity = qres.rows[0].quantity;
        await client.query(`UPDATE public.order_content SET quantity=${current_quantity + quantity}
            WHERE order_id=${order.id} AND item_id=${item.id}`);
    } else {
        await client.query(`INSERT INTO public.order_content (order_id, item_id, quantity) 
            VALUES (${order.id}, ${item.id}, ${quantity})`);
    }
    client.release();
}

async function removeItemFromOrder(order_id, item_id, quantity = null) {
    let order = await findById("order", order_id);
    let item = await findById("item", item_id);

    if (order.paid)
        throw {
            type: "order_already_paid"
        }

    const client = await db_client_pool.connect();
    if (quantity === null) {
        await client.query(`DELETE FROM public.order_content WHERE order_id=${order.id} and item_id=${item.id}`);
        client.release();
        return;
    }
    
    try {
        quantity = validatePosInt(quantity);
    } catch (e) {
        throw {
            type: "invalid_quantity"
        }
    }

    let qres = await client.query(`SELECT * FROM public.order_content WHERE order_id=${order.id} AND item_id=${item.id}`);
    if (qres.rows.length) {
        let current_quantity = qres.rows[0].quantity;
        if (current_quantity <= quantity)
            await client.query(`DELETE FROM public.order_content WHERE order_id=${order.id} and item_id=${item.id}`);
        else
            await client.query(`UPDATE public.order_content SET quantity=${current_quantity - quantity}
                WHERE order_id=${order.id} AND item_id=${item.id}`);  
    }
    client.release();
}

function validatePosInt(value) {
    if (typeof value === "number") {
        if (!Number.isInteger(value) || value <= 0)
            throw new Error();
        return value;
    }
    if (typeof value === "string") {
        if (!/^\d+$/.test(value))
            throw new Error();
        value = parseInt(value);
        if (value <= 0)
            throw new Error();
        return value;
    }
    throw new Error();
}

module.exports = {findUnpaidOrder, createUnpaidOrder, addItemToOrder, removeItemFromOrder};
