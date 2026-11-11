# API Test Results

Tested with the REST Client extension in VS Code against a local PostgreSQL database.

## POST /api/items
Expected: 201 Created, returns the new row.
![POST](docs/screenshots/post.png)

## GET /api/items
Expected: 200 OK, array of all items.
![GET all](docs/screenshots/get-all.png)

## GET /api/items/:id
Expected: 200 OK, one item.
![GET one](docs/screenshots/get-one.png)

## PUT /api/items/:id
Expected: 200 OK, row with updated fields.
![PUT](docs/screenshots/put.png)

## DELETE /api/items/:id
Expected: 204 No Content.
![DELETE](docs/screenshots/delete.png)

## Error cases
- Missing item: 404 Not Found
  ![404](docs/screenshots/404.png)
- Invalid body: 400 Bad Request
  ![400](docs/screenshots/400.png)