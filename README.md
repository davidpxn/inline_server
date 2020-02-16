# inline_server

This repository hosts the code for the server side of project inline.

## Contributors

  * Davíð Phuong Xuan Nguyen, davidpxn

## API
### Authentication

* `/login`

  * `POST` Login with email and password. Returns token:
  ```json
    {
      "email": "user@user.is",
      "password": "password"
    }
  ```
  
* `/signup
`
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
      }
    }
  ```
