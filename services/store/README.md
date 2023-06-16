# Store
## Docker config info
The service itself listens on port 8080. The forwarding is configured to the port 3002 on the host machine. 

### Required environment variables
- DB_HOST - in case of compose it's the name of the postgre service
- DB_PORT - postgre service port, currently it's the default 5432
- DB_NAME - rather self explanatory
- DB_USER - -//-
- DB_PASSWORD - -//-

## Endpoints
### GET /
Returns an opened (unpaid) order of the specified user. Such an unpaid order can only be one (can be thought of as user's current cart) or none at all.

Input parameters:
- user id (pk in the database) as a query parameter

Responses:
- 400 - classic bad request | *look for the message in response body for more info*
- 200 - the user's current unpaid order in response body
- 204 - the user does not have an unpaid order

Examples:<br>
GET<br>
http://localhost:3002?user_id=123 *(from the host machine)*<br>
OR<br>
http://store:8080?user_id=123 *(from another container)*

Response:<br>
400<br>
```json
{
    "message": "User with id 123 does not exist"
}
```

Response:<br>
204<br>
*empty body*

Response:<br>
200<br>
```json
{
    "id": 2345,
    "user_id": 123,
    "paid": false,
    "delivery_address": "Sample text",
    "content": [
        {
            "item": {
                "id": 1357,
                "name": "Item name 1",
                "category_id": 3,
                "owner_id": 2,
                "description": "Sample text",
                "price": 0.8,
                "quantity": 61 // this quantity is the amount of the item in stock
            },
            "quantity": 5 // this quantity is the amount of the item in the order (aka cart)
        },
        {
            "item": {
                "id": 2468,
                "name": "Item name 2",
                "category_id": 4,
                "owner_id": 3,
                "description": "Sample text",
                "price": 200,
                "quantity": 4
            },
            "quantity": 2
        }
    ]
}
```

### POST /
Creates a new opened (unpaid) order for the specified user. Such an unpaid order can only be one (can be thought of as user's current cart).

Input parameters:
- user id (pk in the database) as a query parameter

Responses:
- 400 - classic bad request | *look for the message in response body for more info*
- 409 - conflict with the state of the backend | *e.g. the user already has a current unpaid order*
- 201 - ok | *newly created orded in the response body*

Examples:<br>
POST<br>
http://localhost:3002?user_id=123 *(from the host machine)*<br>
OR<br>
http://store:8080?user_id=123 *(from another container)*

Response:<br>
400<br>
```json
{
    "message": "User with id 123 does not exist"
}
```


Response:<br>
409<br>
```json
{
    "message": "User 123 already has an existing unpaid order"
}
```

Response:<br>
201<br>
```json
{
    "id": 6789,
    "user_id": 123,
    "paid": false,
    "content": []
}
```

### PUT /add
Adds an item to the order (cart).

Input parameters:
- order id (pk in the database) as a query parameter
- item id (pk in the database) as a query parameter
- quantity - as a query parameter - optional

Responses:
- 400 - classic bad request | *look for the message in response body for more info*
- 409 - conflict with the state of the backend | *e.g. the order was already checked out and is paid, therefore cannot be altered*
- 200 - everything went fine

Examples:<br>
PUT<br>
http://localhost:3002/add?order_id=123&item_id=234 *(from the host machine)*<br>
OR<br>
http://store:8080/add?order_id=123&item_id=234 *(from another container)*

PUT<br>
http://localhost:3002/add?order_id=123&item_id=234&quantity=10 *(from the host machine)*<br>
OR<br>
http://store:8080/add?order_id=123&item_id=234&quantity=10 *(from another container)*

Response:<br>
400<br>
```json
{
    "message": "Order with id 123 does not exist"
}
```

Response:<br>
409<br>
```json
{
    "message": "Order 123 is already paid. You can no longer modify it's content"
}
```

Response:<br>
200<br>
*Empty body*<br>
Results in addition of the specified quantity of items to the order. If the quantity is not passed, defaults to 1.

### PUT /remove
Removes an item from the order (cart).

Input parameters:
- order id (pk in the database) as a query parameter
- item id (pk in the database) as a query parameter
- quantity - as a query parameter - optional

Responses:
- 400 - classic bad request | *look for the message in response body for more info*
- 409 - conflict with the state of the backend | *e.g. the order was already checked out and is paid, therefore cannot be altered*
- 200 - everything went fine

Examples:<br>
PUT<br>
http://localhost:3002/add?order_id=123&item_id=234 *(from the host machine)*<br>
OR<br>
http://store:8080/add?order_id=123&item_id=234 *(from another container)*

PUT<br>
http://localhost:3002/add?order_id=123&item_id=234&quantity=10 *(from the host machine)*<br>
OR<br>
http://store:8080/add?order_id=123&item_id=234&quantity=10 *(from another container)*

Response:<br>
400<br>
```json
{
    "message": "Order with id 123 does not exist"
}
```

Response:<br>
409<br>
```json
{
    "message": "Order 123 is already paid. You can no longer modify it's content"
}
```

Response:<br>
200<br>
*Empty body*<br>
Results in removal of the specified quantity of items from the order. __If the quantity is not passed, the whole position is removed.__