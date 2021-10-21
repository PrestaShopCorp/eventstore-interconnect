# EventstoreInterconnect

## Aim

The aim of this project is to provide a lib able to interconnect 2 eventstores, that have 2 different versions. These version are : v5.0.1 and v21.2.0

These usecases are listed here :
- client connects to v21.x, create/connect to persistent subscription, and write the events red on a v5.x stream


### Usecase1 (v5 -> v5):
build docker container for eventstore 1 :

`docker run --name eventstore-legacy -it -p 2113:2113 -p 1113:1113 eventstore/eventstore:release-5.0.9`

build docker container for eventstore 2 :

`docker run --name eventstore-legacy-11130-21130 -it -p 2113:21130 -p 1113:11130 eventstore/eventstore:release-5.0.9`
