const express = require('express');
const router = express.Router();
const _ = require('lodash');

const service = require("./service");

router.get("/", async (req, res, next) => {
    const { user_id } = req.query;
    if (!user_id)
        return res.status(400).send({ message: "Request is expected to have a 'user_id' query parameter" });

    try {
        let order = await service.findUnpaidOrder(user_id);
        if (order)
            return res.status(200).send(order);
        return res.status(204).send();
    } catch (err) {
        switch (err.type) {
            case "user_invalid_id":
                return res.status(400).send({ message: `User id ${user_id} is not a valid id: ${err.message || ""}` });
            case "user_does_not_exist":
                return res.status(400).send({ message: `User with id ${user_id} does not exist` });
            default:
                console.error("get order | unexpected error: " + err.message || err);
                next(err);
        }
    }
});

router.post("/", async (req, res, next) => {
    const { user_id } = req.query;
    if (!user_id)
        return res.status(400).send({ message: "Request is expected to have a 'user_id' query parameter" });

    try {
        return res.status(201).send(await service.createUnpaidOrder(user_id));
    } catch (err) {
        switch (err.type) {
            case "user_invalid_id":
                return res.status(400).send({ message: `User id ${user_id} is not a valid id: ${err.message || ""}` });
            case "user_does_not_exist":
                return res.status(400).send({ message: `User with id ${user_id} does not exist` });
            case "order_already_exists":
                return res.status(409).send({ message: `User ${user_id} already has an existing unpaid order` });
            default:
                console.error("create order | unexpected error: " + err.message || err);
                next(err);
        }
    }
});

router.put("/add", async (req, res, next) => {
    const { order_id, item_id, quantity } = req.query;
    if (!order_id)
        return res.status(400).send({ message: "Request is expected to have an 'order_id' query parameter" });
    if (!item_id)
        return res.status(400).send({ message: "Request is expected to have an 'item_id' query parameter" });
        
    try {
        if (quantity)
            await service.addItemToOrder(order_id, item_id, quantity);
        else 
            await service.addItemToOrder(order_id, item_id);
        return res.status(200).send();
    } catch (err) {
        switch (err.type) {
            case "order_invalid_id":
                return res.status(400).send({ message: `Order id ${order_id} is not a valid id: ${err.message || ""}` });
            case "order_does_not_exist":
                return res.status(400).send({ message: `Order with id ${order_id} does not exist` });
            case "item_invalid_id":
                return res.status(400).send({ message: `Item id ${item_id} is not a valid id: ${err.message || ""}` });
            case "item_does_not_exist":
                return res.status(400).send({ message: `Item with id ${item_id} does not exist` });
            case "order_already_paid":
                return res.status(409).send({ message: `Order ${order_id} is already paid. You can no longer modify it's content` });
            case "invalid_quantity":
                return res.status(400).send({ message: `Quantity ${quantity} is not valid. Expected a positive integer` });
            default:
                console.error("add item | unexpected error: " + err.message || err);
                next(err);
        }
    }
});

router.put("/remove", async (req, res, next) => {
    const { order_id, item_id, quantity } = req.query;
    if (!order_id)
        return res.status(400).send({ message: "Request is expected to have an 'order_id' query parameter" });
    if (!item_id)
        return res.status(400).send({ message: "Request is expected to have an 'item_id' query parameter" });
        
    try {
        if (quantity)
            await service.removeItemFromOrder(order_id, item_id, quantity);
        else 
            await service.removeItemFromOrder(order_id, item_id);
        return res.status(200).send();
    } catch (err) {
        switch (err.type) {
            case "order_invalid_id":
                return res.status(400).send({ message: `Order id ${order_id} is not a valid id: ${err.message || ""}` });
            case "order_does_not_exist":
                return res.status(400).send({ message: `Order with id ${order_id} does not exist` });
            case "item_invalid_id":
                return res.status(400).send({ message: `Item id ${item_id} is not a valid id: ${err.message || ""}` });
            case "item_does_not_exist":
                return res.status(400).send({ message: `Item with id ${item_id} does not exist` });
            case "order_already_paid":
                return res.status(409).send({ message: `Order ${order_id} is already paid. You can no longer modify it's content` });
                case "invalid_quantity":
                    return res.status(400).send({ message: `Quantity ${quantity} is not valid. Expected a positive integer` });
            default:
                console.error("remove item | unexpected error: " + err.message || err);
                next(err);
        }
    }
});

module.exports = router;
