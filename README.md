# Flight Booking Confirmation

Searches for electronic tickets in gmail inbox and uploads it to cloud storage

## Requirements

* Node v8+
* Google Cloud project

## Installation
```
$ npm i
```

## Usage
```
$ npm start
```
Go to http://localhost:1234

## How it works

1. Users are logged in using Google account
2. Then we get a list of user's Gmail messages that matched search query (e.g. "Electronic ticket")
3. After that we get a list of attached files for every of those messages
4. PDF files are uploaded to storage, other are ignored

***By modules:***
```app.js``` → ```authorization.js``` → ```mail.js``` → ```storage.js```
