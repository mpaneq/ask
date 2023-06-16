# Catalogue

## Endpoints
### POST /
Adding item

### GET /<item_id>

### GET /filter
```json
{
    "category_id": 2,
    "owner_id": "sample",
    "price": {
        "min": 123,
        "max": 3456
    } 
}
```

<br><br>*At some point docker network will be configured is such a way that all of the services except the Primary Entrypoint will be unavailable. Until then you may request the endpoints using your preferred client (e.g. Postman).*
