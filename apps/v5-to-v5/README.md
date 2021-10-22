### Usecase 1 (v5 -> v5):
build docker container for SOURCE eventstore (eventbus) :

`docker run --name eventstore-legacy-11130-21130 -it -p 2113:21130 -p 1113:11130 eventstore/eventstore:release-5.0.9`

build docker container for DESTINATION eventstore (facebook) :

`docker run --name eventstore-legacy -it -p 2113:2113 -p 1113:1113 eventstore/eventstore:release-5.0.9`

