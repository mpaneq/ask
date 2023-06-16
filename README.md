# Internet Shop
This repo contains a backend of a university group project for 'distributed systems' subject.

The goal is to create an internet shop, where people will be able to put up their items for sale or purchase other people's items. People have their internal wallets with virtual money which they use for trading. Integration with real payment systems is beyond the concern of this project. Primary goal is to create a distributed system with microservice architecture where services may communicate with each other.

MVP end should will allow for:
- creating user accounts and logging in
- putting up owned items for sale (providing description, price and other required data)
- browsing other peoples' items using optional filters
- adding items to cart, modifying current order and finalizing it (by performing payment)
- browsing one's past orders
- generating invoices for bought items as pdf files

Backend consists of several microservices each run in docker using compose. This repo contains all those microservies along with configuration files to run everything.

## Architecture and description
*Things you are gonna read down below might be a subject for constant change*

![architecture](./misc/architecture.jpg)

Services:
- Payment Service - manages the payments, checks out orders, issues invoices, etc.
- Catalogue Service - enables users to publish their items, viewing others' items, filtering, etc.
- Store Service - enables cart functionality, order composition, etc.
- Entrypoint Service - provides UI views, handles authorization, routes requests, etc.

Technologies:
- Docker - OS-level virtualization software | running services
- Node.js - runtime environment for JS | backend microservices
- Express - JS library for HTTP servers
- PostgreSQL - a database for storing users, items, orders and other data
- node-postgres (pg) - a JS library for Postgre connection
- Ruby on Rails - web-app framework | backend / UI views


## How to run the backend?
1. Install Docker https://www.docker.com/
2. Clone project
3. Launch Docker on your machine
4. In project directory run 
```sh
docker compose up --build
```
5. You now have everything set up (at least in theory). Try to make a request to one of the services using apps such as Postman (or a browser of your choice)

<br>*Also might be worthwhile to check out individual services READMEs*<br>


## How to contribute?
1. Create a branch for a feature you want to add
2. Push the branch to origin
2. Create a pull request and request a review from one of the team members


## Useful resources
Docker overview<br>
https://youtu.be/gAkwW2tuIqE

Docker volumes<br>
https://youtu.be/p2PH_YPCsis

Getting started with Node.js<br>
https://nodejs.dev/en/learn/

Express<br>
https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm

PG<br>
https://node-postgres.com/