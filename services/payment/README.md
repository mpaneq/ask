# Payment
## Docker config info
The service is run on the 3000 port (may be changed in compose configs). 

### Requied environment variables
- DB_HOST - in case of compose it's the name of the postgre service
- DB_PORT - postgre service port, currently it's the default 5432
- DB_NAME - rather self explanatory
- DB_USER - -//-
- DB_PASSWORD - -//-

## Endpoints
### POST /checkout/<order_id>

Input parameters:
- order id (pk in the database)

The endpoint does the following:
- reduces the number of items in stock (because they are being bought)
- adds money to sellers' balances
- takes money from the buyer's balance
- marks the order as paid

Responses:
- 400 - classic bad request | *look for the message in response body for more info*
- 409 - an error occured durind the transaction | *look for the message in response body for more info*
- 200 - everything went fine | *empty body*

Examples:<br>
POST<br>
http://localhost:3000/checkout/5678<br>

Response:
400
```json
{
    "message": "Order with id '5678' does not exist"
}
```

POST<br>
http://localhost:3000/checkout/1<br>

Response:
409
```json
{
    "message": "Buyer's balance is insufficient to perform checkout"
}
```

POST<br>
http://localhost:3000/checkout/2<br>

Response:
200

### GET /invoice/<order_id>
Input parameters:
- order id (pk in the database)

Generates a pdf with with invoice(s) for passed order.<br>
In case the order contains items from different sellers the pdf will contain several invoices - one for each seller. Each invoice is generated on a separate page in the pdf.

Responses:
- 400 - classic bad request | *look for the message in response body for more info*
- 200 - the pdf is sent as a stream

Examples:<br>
GET<br>
http://localhost:3000/checkout/123<br>

Response:
400
```json
{
    "message": "Order with id '123' does not exist"
}
```

<br><br>*At some point docker network will be configured is such a way that all of the services except the Primary Entrypoint will be unavailable. Until then you may request the endpoints using your preferred client (e.g. Postman).*
