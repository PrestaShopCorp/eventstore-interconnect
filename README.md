# EventstoreInterconnect

(This project was generated using [Nx](https://nx.dev).)


## Aim

The aim of this project is to provide a lib able to interconnect 2 eventstores, that have 2 different versions. These version are : v5.0.1 and v21.2.0

So we have a libs folder, that contains at first the main lib : [eventstore-interconnect](./libs/eventstore-interconnect). The other lib, [nestjs-geteventstore-legacy-proxy](./libs/nestjs-geteventstore-legacy-proxy), is used by [eventstore-interconnect](./libs/eventstore-interconnect) in order to use the legacy connector. 

The [apps](./apps) folder contains the examples app, that consist in a batch of usecases (writing in a version A after reading in a version B, vis-versa etc)

These usecases are listed here :  
- client connects to v21.x, create/connect to persistent subscription, and write the events red on a v5.x stream 
