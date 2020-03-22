# inline_server

This repository hosts the code for the server side of project inline.


## Contributors

| Name        | Email           | Github  |
| ------------- |-------------| -----|
| Davíð Phuong Xuan Nguyen     | davidpxn97@gmail.com | davidpxn |


## API

Authentication with a bearer token is required for all request except to `/`, `/login` and `/signup`.

### API 

* `/`
  * `GET` Returns all available API endpoints.
  
### Authentication

* `/login`
  * `POST` Login with email and password. Returns token:
  ```json
    {
      "email": "admin@company.com",
      "password": "admin"
    }
  ```
  
* `/signup`
  * `POST` Signup a new company and admin user:
  ```json
  {
    "user": {
      "name": "User",
      "email": "user@user.is",
      "password": "password",
      "passwordConfirm": "password"
    },
    "company": {
      "name": "Company",
      "country": "Iceland",
      "website": "company.com"
    },
    "branch": {
    	"name": "Home"
    }
  }
  ```

### Users

* `/users`
  * `GET` Returns all relevant users.
  
* `/users/create`
  * `POST` Create a new user:
  ```json
  {
    "name": "User",
    "email": "user@user.is",
    "password": "password",
    "passwordConfirm": "password",
    "branch": 1,
    "role": "agent"
  }
  ```
