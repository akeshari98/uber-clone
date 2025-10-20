# Backend API - Users

This document describes the POST `/users/register` endpoint used to register a new user.

## Endpoint

- URL: `/users/register`
- Method: `POST`

## Description

Creates a new user account. The endpoint validates the incoming data, hashes the password, saves the user to the database, and returns a JWT token on success.

## Request Body

Content-Type: `application/json`

Body fields:

- `fullname` (object, required)
  - `firstname` (string, required) — minimum 3 characters
  - `lastname` (string, optional) — minimum 3 characters if provided
- `email` (string, required) — minimum 5 characters, must be unique
- `password` (string, required)

Example request body:

```
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "jane.doe@example.com",
  "password": "StrongP@ssw0rd"
}
```

## Responses / Status Codes

- `201 Created` — User registered successfully. Response body:

```
{
  "token": "<jwt-token>",
  "message": "User registered successfully"
}
```

- `400 Bad Request` — Validation error or user with this email already exists. Example responses:

Validation failure:

```
{
  "errors": [
    { "msg": "First name must be at least 3 characters long", "param": "fullname.firstname" }
  ]
}
```

Email exists:

```
{
  "message": "User with this email already exists"
}
```

- `500 Internal Server Error` — Unexpected server/database error. Example response:

```
{
  "message": "Internal server error"
}
```











## Login Endpoint

- URL: `/users/login`
- Method: `POST`

### Description

Authenticates an existing user using their email and password. On success, returns a JWT token. Password comparison uses bcrypt and the stored password is selected explicitly in the controller when checking credentials.

### Request Body

Content-Type: `application/json`

Body fields:

- `email` (string, required) — must be a valid email
- `password` (string, required) — minimum 6 characters

Example request body:

```
{
  "email": "jane.doe@example.com",
  "password": "StrongP@ssw0rd"
}
```

### Responses / Status Codes

- `200 OK` — Login successful. Response body:

```
{
  "token": "<jwt-token>",
  "message": "User logged in successfully"
}
```

- `401 Unauthorized` — Invalid email or password. Example response:

```
{
  "message": "Invalid email or password"
}
```

- `400 Bad Request` — Validation errors (e.g., invalid email format, password too short). Example:

```
{
  "errors": [
    { "msg": "Invalid Email", "param": "email" }
  ]
}
```

- `500 Internal Server Error` — Unexpected server/database error.

### How to test the login endpoint locally

Use the server started in the previous section and send a POST request to `http://localhost:3000/users/login` with the JSON body shown above.

Example PowerShell curl (after registering a user):

```powershell
curl -Method POST -ContentType 'application/json' -Body (ConvertTo-Json @{
  email = 'jane.doe@example.com'
  password = 'StrongP@ssw0rd'
}) 'http://localhost:3000/users/login'
```

## Notes and validation rules

- The `password` is hashed before saving. The stored `password` field is not returned in responses.
- The generated JWT is signed with `process.env.JWT_SECRET` and expires in 1 hour.
- Ensure the `Content-Type: application/json` header is set.

## How to test locally

1. Start the backend server (from the `backend` folder):

```powershell
cd c:\Users\akesh\OneDrive\Desktop\uber\backend; npm install; node server.js
```

2. Use curl, Postman, or any HTTP client to send a POST request to `http://localhost:3000/users/register` (adjust host/port if your server config differs).

Example curl (PowerShell):

```powershell
curl -Method POST -ContentType 'application/json' -Body (ConvertTo-Json @{
  fullname = @{ firstname = 'Jane'; lastname = 'Doe' }
  email = 'jane.doe@example.com'
  password = 'StrongP@ssw0rd'
}) 'http://localhost:3000/users/register'
```

## Related files

- `controllers/user.controller.js` — contains the registration logic and response handling.
- `models/user.model.js` — schema, password hashing and token generation logic.
- `services/user.service.js` — user creation helper (note: service currently creates raw user; controller uses model directly).
