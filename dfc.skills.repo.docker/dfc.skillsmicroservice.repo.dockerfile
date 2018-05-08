# docker build -f dfc.skillsmicroservice.repo.dockerfile --tag monsteruk/dfc.skillsmicroservice.repo .
# docker run -p 5432:5432 --name dfc.skillsmicroservice.repo -e POSTGRES_PASSWORD=p@55w0rd -e POSTGRES_DB=dfc-skills -d monsteruk/dfc.skillsmicroservice.repo

FROM postgres:latest

MAINTAINER Roy Bailey

# RUN ["mkdir", "/docker-entrypoint-initdb.d"]
COPY      ./.docker/scripts/postgresinit.sql /docker-entrypoint-initdb.d/

EXPOSE 5432

