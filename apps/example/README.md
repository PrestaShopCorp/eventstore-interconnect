## Usecase:
build docker container for SOURCE eventstore (eventbus) :

### Starter pack

In order to run the example, you will need 2 eventstores of 2 different versions :

### The legacy one (v5) :
```
docker run --name eventstore-legacy-11130-21130 \ 
-it -p 2113:21130 -p 1113:11130 \ 
eventstore/eventstore:release-5.0.9
```

### The next one (v21):
```
docker run --name eventstore-next-version-2113-1113 \
-it -p 2113:2113 -p 1113:1113 \
eventstore/eventstore:latest \
--insecure \
--run-projections=All \
--enable-atom-pub-over-http
```

### Start the correct example

You will see in the package.json that there are 4 examples you can run. These are the 4 situation the lib aims to help for :

**legacy to legacy version** 
```typescript
yarn run start:usecase:srcLegDestLeg
```
**legacy to next version**
```typescript
yarn run start:usecase:srcLegDestNext
```
**next to legacy version**
```typescript
yarn run start:usecase:srcNextDestLeg
```
**next to next version**
```typescript
yarn run start:usecase:srcNextDestNext
```
This will start the server with the correct configuration. 

### Start process : 

Now, the last thing you have to do is to run the web service at this adress : 

```
localhost:3000/start
```

This will write at first a valid event, and then an invalid, so you can try different things : 
you can write other types of events, with custom handler behavior, you can remove the override of the safety strategy (cf SAFETY_NET part), you can try the env variable, and you also can try to validate your way the events. Enjoy! (if you see bugs, feel free to create an issue, it'll be very appreciated)

#### SAFETY_NET:

It is possible to override the default safety net strategy, as you can see in the [usecase module](./src/usecase.module.ts) :

```typescript
    {
      provide: SAFETY_NET,
      useClass: CustomSafetyNet, // here, you can provide your custom strategy
    },
```

Note that you can use this safety net in order to log thing, using an external system like Sentry, that would not be provided by the lib.
