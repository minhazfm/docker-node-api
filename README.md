# DockerNodeAPI

This is a sample of a Node API running in a docker container.

# Getting Started

Make sure you have `nvm` for Mac or `nvm-windows` for Windows installed, and have set up the latest v8 of Node.js under one of those node version managers (latest at the time of this documentation is v8.15.1)

```bash
Mac: https://github.com/creationix/nvm
Windows: https://github.com/coreybutler/nvm-windows
```

You'll need the following global dependencies installed as well before attempting to run this project. Run the following command before attempting to run the project:

```bash
$ npm install -g gulp typescript
```

To run the project:

```bash
$ git clone git@github.com:minhazfm/docker-node-api.git
$ cd docker-node-api
$ npm install
$ gulp develop
```

# For Windows Users

Check out http://blog.teamtreehouse.com/install-node-js-npm-windows for installation details

Note: in cygwin I ran "npm install --global gulp" to install gulp.


# Possible Requests

### Things To Remember
* Always include a `Client-Type` that has `client="yourClientName";` and `version="theAPIVersionYouAreRequesting"` in your Request Headers, for example:

```
Client-Type: client=snMobile;version=1.0.0
```

* The registration and login API do not require a token to be used, but for the login request use the following credentials: `username -> testuser` and `password -> 123123`

### Registration API
```
POST http://0.0.0.0:3000/rest/registration
Version: 1.0.0
Request Body
{
    "username": string
}
```

### Login API
```
POST http://0.0.0.0:3000/rest/user/login
Version: 1.0.0
Request Body
{
    "username": string,
    "password": string
}
```

### Logout API
```
POST http://0.0.0.0:3000/rest/user/logout
Version: 1.0.0
```

### Account API
```
GET http://0.0.0.0:3000/rest/user/account
Version: 1.0.0
```

### Login and Account Together API
```
POST http://0.0.0.0:3000/rest/user/login/account
Version: 1.0.0
```

### Server Side Events API
```
GET http://0.0.0.0:3000/rest/events/gatewayId/21
Version: 1.0.0

* You will want to do this in a CURL command as POSTMAN does not support SSE, for example:

curl --header "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OWMwOGViNS1kZGZhLTQxMzQtYjIwNC04ZDI1YTFhZGYxMDEiLCJ1dWlkIjoiYTg5ZjZmN2EtYWQzYi0xMWU4LTk4ZDAtNTI5MjY5ZmIxNDU5IiwiaWF0IjoxNTM2MTYzMzY5LCJleHAiOjE1MzY3NjgxNjl9.DxKeoOugUASx8gFmGvqpsMJiYbKFgPmv6E5TlTR-CUU" --header "Content-Type: application/json" --header "Client-Type: client=snMobile;version=1.0.0" \
  --request GET \
  http://0.0.0.0:3000/rest/events/gatewayId/21
```


# Authors

* Minhaz Mohammad <minhazfm@gmail.com>