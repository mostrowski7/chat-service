## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)

## General info
Simple chat service using Socket.io

## Technologies
* NestJS
* Knex migrations
* PostgreSQL raw queries
* Jest
* Docker
* CircleCI
	
## Setup
### Run
```
# Build
$ docker-compose build

# Start
$ docker-compose up -d
```

### Migration
```
$ docker-compose run api npm run migration
```

### Test
```
$ docker-compose run api npm run test
```

## Features
* Validates user token
* Connects to room
* Sends a message as user
* Retrieves messages from specific room

### To Do:
* Typing
* Private messages
* Commands
