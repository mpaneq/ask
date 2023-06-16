const express = require('express');
const router = express.Router();
const _ = require('lodash');
const moment = require("moment-timezone");
const db_client_pool = require("./db");
const PDFDocument = require('pdfkit-table');
const Order = require("./helpers/order");
const User = require("./helpers/user");

router.get("/invoice/:order_id", async (req, res, next) => {
    const order_id = req.params.order_id;
    const client = await db_client_pool.connect();
    let order;
    try {
        order = await Order.findById(client, order_id);
        if (!order.paid)
            throw {
                type: "order_not_yet_paid"
            };
        
        let order_data = order;
        order_data.buyer = await User.findById(client, order.user_id);

        let order_content = await Order.getOrderContent(client, order_id);
        order_content = _.groupBy(order_content, "item.owner_id");
        order_data.content = await Promise.all(_.keys(order_content).map(async key => {
            return {
                seller: await User.findById(client, key),
                positions: order_content[key]
            };
        })); 

        (await generateInvoice(order_data)).pipe(res);
    } catch (err) {
        switch (err.type) {
            case "order_invalid_id":
                return res.status(400).send({ message: "Provided value '" + order_id + "' is not valid: " + err.message || "" });
            case "order_does_not_exist":
                return res.status(400).send({ message: "Order with id '" + order_id + "' does not exist" });
            case "order_not_yet_paid":
                return res.status(400).send({ message: "This order is not yet paid" });
            default:
                console.error("invoice | unexpected error: " + err.stack || err.message || err);
                return next(err);
        }
    } finally {
        client.release();
    }
});

async function generateInvoice(data) {
    // pdfkit-table doesn't support specifying column width as percentage
    // so these are somewhat arbitrary numbers based on the width of an A4 page and lib's defaults
    // these are later used to set the column widths, offsets etc.
    const content_width = 450;
    const left_margin = 70;
    const top_margin = 60;
    const currency_name = "VPLN";

    const doc = new PDFDocument({ 
        size: 'A4' 
    });    

    // content here is an array of "groups" of items in the order
    // the items are grouped by their seller, so a group has a seller and a subset of items from the order
    // this loop generates a page for each seller, so each page is actually a separate invoice
    data.content.forEach((group, index) => {
        // only need to add page if it's not the first group
        if (index > 0)
            doc.addPage();

        //adding logo to the left top corner
        doc.image(__dirname + "/resources/shop_logo.png", left_margin + 20, top_margin, 
            { width: Math.floor(content_width * 0.3) });

        //adding general invoice info to the right alongside with logo
        let options = defaultTableOptions();
        options.x = Math.floor(content_width * 0.55) + left_margin;
        options.divider.header.disabled = true;
        options.divider.horizontal.disabled = true;
        doc.table({ 
            headers: [
                applyDefaultHeaderOptions(
                    { label: "ID Zamówienia", property: "id", width: Math.floor(content_width * 0.45), align: "center" }
                )
            ],
            datas: [{ id: data.id, options: defaultTableDatasOptions(0) }],
            options
        }, defaulTablePreparers(doc));

        doc.moveDown(1);

        doc.table({ 
            headers: [
                applyDefaultHeaderOptions(
                    { label: "Data wystawienia", property: "date", width: Math.floor(content_width * 0.45), align: "center" }
                )
            ],
            datas: [{ 
                date: moment().tz("Europe/Warsaw").locale("pl").format("DD-MM-YYYY"),
                options: defaultTableDatasOptions(0) 
            }],
            options
        }, defaulTablePreparers(doc));

        //adding info about the buyer and the seller
        doc.moveDown(4);
        //resetting x position of the future table and setting y to draw both tables on the same level
        options.x = null;
        options.y = doc.y;
        doc.table({ 
            headers: [
                applyDefaultHeaderOptions(
                    { label: "Sprzedawca", property: "text", width: Math.floor(content_width * 0.45), align: "left" }
                )
            ],
            datas: [{ text: getUserDescription(group.seller), options: defaultTableDatasOptions(0) }],
            options
        }, defaulTablePreparers(doc));

        options.x = Math.floor(content_width * 0.55) + left_margin;
        doc.table({ 
            headers: [
                applyDefaultHeaderOptions(
                    { label: "Nabywca", property: "text", width: Math.floor(content_width * 0.45), align: "left" }
                )
            ],
            datas: [{ text: getUserDescription(data.buyer), options: defaultTableDatasOptions(0) }],
            options
        }, defaulTablePreparers(doc));

        
        // adding info about the actual items in the order
        options.x = null;
        options.y = null;
        options.title = "Kupione towary";
        options.divider.header.disabled = false;
        options.divider.horizontal.disabled = false;
        let table = { 
            headers: [
                { "label": "Nazwa", "property": "item", width: Math.floor(content_width * 0.5) },
                { "label": "Cena", "property": "price", width: Math.floor(content_width * 0.21) },
                { "label": "Ilość", "property": "quantity", width: Math.floor(content_width * 0.08) },
                { "label": "Suma", "property": "sum", width: Math.floor(content_width * 0.21) }
            ].map(header => applyDefaultHeaderOptions(header)),
            datas: group.positions.map((position, index) => {
                return {
                    item: position.item.name,
                    price: position.item.price.toFixed(2) + " " + currency_name,
                    quantity: position.quantity,
                    sum: (position.item.price * position.quantity).toFixed(2) + " " + currency_name,
                    options: defaultTableDatasOptions(index)
                }
            }),
            options
        };

        doc.moveDown(2);
        doc.table(table, defaulTablePreparers(doc));

        let group_sum = group.positions
            .map(position => position.item.price * position.quantity)
            .reduce((sum, position_price) => sum + position_price, 0);
            
        doc.font(__dirname + "/resources/Roboto-Bold.ttf").fontSize(14);
        doc.text("Do zapłaty: " + group_sum.toFixed(2) + " " + currency_name, {
            align: 'right'
        });

        // adding places for the signatures
        doc.moveDown(4);
        doc.font(__dirname + "/resources/Roboto-Regular.ttf").fontSize(9);
        let underline = "______________________________________";
        doc.text(
            underline + "\nPodpis Sprzedawcy" + 
            "\n" + underline + "\nPodpis Nabywcy", 
            {
                columns: 2,
                columnGap: 20,
                height: 30,
                width: content_width,
                align: 'center'
            }
        );
    });
    
    doc.end();
    return doc;
}

const applyDefaultHeaderOptions = (header) => {
    header.valign ||= "center";
    header.headerColor ||= "#b5b5b5";
    header.headerOpacity ||= 1;
    return header;
}

const defaultTableOptions = () => {
    return {
        divider: {
            header: { disabled: false, width: 2, opacity: 1 },
            horizontal: { disabled: false, width: 1, opacity: 1 },
        },
        padding: 5,
        font: __dirname + "/resources/Roboto-Regular.ttf",
        fontSize: 14
    };
}

const defaultTableDatasOptions = (index) => { 
    return {
        backgroundColor: index % 2 == 0 ? "#f5f5f5" : "#e5e5e5",
        backgroundOpacity: 1
    }
}

const defaulTablePreparers = (doc) => {
    return {
        prepareHeader: () => {
            doc.font(__dirname + "/resources/Roboto-Regular.ttf").fontSize(10.5);
        },
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font(__dirname + "/resources/Roboto-Regular.ttf").fontSize(10.5);
        }
    }
}

const getUserDescription = (user) => {
    let text = "";
    text += user.name ? (user.name + "\n") : "";
    text += user.email ? (user.email + "\n") : "";
    text += user.tax_id ? (user.tax_id + "\n") : "";
    return text.trim();
}

module.exports = router;