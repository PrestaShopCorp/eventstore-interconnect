## Usecase:

In order to run the example, you will need 2 eventstores for 2 different versions so then you will be able to reproduce
these situations :

- read on source v5 and write on destination v5
- read on source v21 and write on destination v5
- read on source v5 and write on destination v21
- read on source v21 and write on destination v21

you can directly copy past all this command, and you will have the 4 versions you need in one shot :

```shell
### The legacy one (v5, src and dest) :
docker run -d --name eventstore-source-legacy-21131-11131 -it -p 21131:2113 -p 11131:1113 eventstore/eventstore:release-5.0.9
docker run -d --name eventstore-dest-legacy-21132-11132 -it -p 21132:2113 -p 11132:1113 eventstore/eventstore:release-5.0.9
### The next one (v21, src and dest):
docker run -d --name eventstore-next-source-version-21133-11133 -it -p 21133:2113 -p 11133:1113 eventstore/eventstore:latest --insecure --run-projections=All --enable-atom-pub-over-http
docker run -d --name eventstore-next-dest-version-21134-11134 -it -p 21134:2113 -p 11134:1113 eventstore/eventstore:latest --insecure --run-projections=All --enable-atom-pub-over-http
```

Special not for people working on arm64 architecture (for example, M1 Silicon...) The docker images are yet a alpha releases. Today, you can get this v21 with silicon arch this way : 

```shell
docker run -d --name M1-eventstore-next-source-version-21133-11133 -it -p 21133:2113 -p 11133:1113 ghcr.io/eventstore/eventstore:21.10.0-alpha-arm64v8 --insecure --run-projections=All --enable-atom-pub-over-http
docker run -d --name M1-eventstore-next-dest-version-21134-11134 -it -p 21134:2113 -p 11134:1113 ghcr.io/eventstore/eventstore:21.10.0-alpha-arm64v8 --insecure --run-projections=All --enable-atom-pub-over-http

```

### Start the correct example

You will see in the package.json that there are 4 examples you can run. These are the 4 situation the lib aims to help
for :

**legacy to legacy version**

```typescript
yarn
run
start:usecase:srcLegDestLeg
```

**legacy to next version**

```typescript
yarn
run
start:usecase:srcLegDestNext
```

**next to legacy version**

```typescript
yarn
run
start:usecase:srcNextDestLeg
```

**next to next version**

```typescript
yarn
run
start:usecase:srcNextDestNext
```

This will start the server with the default configuration. You can customize this configuration by modifying modifying
the .env file.

### Start process :

Now, to test the process, you need to write an event inside one of the 2 source eventstores. To do so, here are the 4
urls you need to access your 4 eventstores :

- [Legacy source](http://localhost:21131) : http://localhost:21131
- [Legacy dest](http://localhost:21132) : http://localhost:21132
- [Next source](http://localhost:21133) : http://localhost:21133
- [Next dest](http://localhost:21134) : http://localhost:21134

This will write at first a valid event, and then an invalid, so you can try different things :
you can write other types of events, with custom handler behavior, you can remove the override of the safety strategy (
cf SAFETY_NET part), you can try the env variable, and you also can try to validate your way the events. Enjoy! (if you
see bugs, feel free to create an issue, it'll be very appreciated)

#### SAFETY_NET:

It is possible to override the default safety net strategy, as you can see in
the [usecase module](src/usecase.module.ts) :

```typescript
    {
      provide: SAFETY_NET,
      useClass:  CustomSafetyNet, // here, you can provide your custom strategy
    }
```

Note that you can use this safety net in order to log thing, using an external system like Sentry, that would not be
provided by the lib.
