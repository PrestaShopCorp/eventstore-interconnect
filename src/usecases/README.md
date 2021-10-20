### Usecase1 (v5 -> v5):
build the facebook legacy eventstore  :

`docker run --name eventstore-legacy -it -p 2113:2113 -p 1113:1113 eventstore/eventstore:release-5.0.9`

build the eventbus legacy eventstore :

`docker run --name eventstore-legacy-11130-21130 -it -p 2113:21130 -p 1113:11130 eventstore/eventstore:release-5.0.9`
