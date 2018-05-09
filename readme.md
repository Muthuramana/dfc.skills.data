# o-net skills docker database, and population script

This simple repo allows you to create a postgres database in docker, and provides a small node application to populate that database with the o-net skills information from the lmiforall website.

## Usage:

### Get the docker postgres database up and running (obviously, you need docker up and running)

After cloning the repo, open a command prompt and...

1. cd .\dfc.skills.repo.docker
2. docker-compose up -d

The database will now be created and postgres will be available on the host on port: 5432 (standard postgres port)

You can later start and stop the database container (without losing your data), using

* docker-compose start
* docker-compose stop

When you are completely done with the container (and want to get rid of it, and the data), run

* docker-compose down

### Populate the database with onet data

Use the following steps to populate the postgres database above.

Notes. 
* You need a web connection, and the node app accesses the lmiforall web api)
* You need node.js installed on your machine.

1. cd PopulateOnetSkillsDB 
2. node .\server.js

Once the node app has completed, the database will be populated.  You do not ned to run it again, unless you remove to the postgres container and later re-create it.


