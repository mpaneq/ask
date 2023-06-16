const express = require('express');
const router = express.Router();
const _ = require('lodash');
const db_client_pool = require("./db");

const Order = require("./helpers/order");

router.post("/checkout/:order_id", async (req, res, next) => {
    const order_id = req.params.order_id;

    // this claims a db client from the pool
    // note: the whole transaction must be performed on a single client
    console.log("checkout | claiming client...");
    client = await db_client_pool.connect();

    try {
        console.log("checkout | starting...");
        // here the transaction starts
        await client.query("BEGIN");

        console.log("checkout | removing items...");
        // reduce the number of items in stock
        await Order.removePurchasedItems(client, order_id);

        console.log("checkout | adding money...");
        // add money to sellers' wallets
        await Order.addMoneyToSellers(client, order_id);
        
        console.log("checkout | substracting money...");
        // substract the money from the buyer
        await Order.substractMoneyFromBuyer(client, order_id);   
        
        console.log("checkout | marking as paid...");
        // mark order as paid
        await Order.setPaid(client, order_id);
        
        console.log("checkout | finalizing...");
        //finalize the transaction
        await client.query("COMMIT");

        res.status(200).send();
    } catch (err) {
        switch (err.type) {
            case "order_invalid_id":
                res.status(400).send({ message: "Provided value '" + order_id + "' is not valid: " + err.message || "" });
                break;
            case "order_does_not_exist":
                res.status(400).send({ message: "Order with id '" + order_id + "' does not exist" });
                break;
            case "order_already_paid":
                res.status(409).send({ message: "This order is already paid" });
                break;
            case "not_enough_items":
                res.status(409).send({ message: "This order contains items that are currently out of stock" });
                break;
            case "insufficient_balance":
                res.status(409).send({ message: "Buyer's balance is insufficient to perform checkout" });
                break;
            default:
                console.error("checkout | unexpected error: " + err.message || err);
                next(err);
        }
        console.log("checkout | aborting transaction...");
        await client.query("ROLLBACK");
    } finally {
        console.log("checkout | releasing client...");
        client.release();
    }
    return;
});

module.exports = router;