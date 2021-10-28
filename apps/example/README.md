### Usecase 2 (v5 -> v21):
build docker container for SOURCE eventstore (eventbus) :

```
docker run --name eventstore-legacy-11130-21130 \ 
-it -p 2113:21130 -p 1113:11130 \ 
eventstore/eventstore:release-5.0.9
```

build docker container for DESTINATION eventstore (facebook) :

```
docker run --name eventstore-next-version \
-it -p 2113:2113 -p 1113:1113 \
eventstore/eventstore:latest \
--insecure \
--run-projections=All \
--enable-atom-pub-over-http
```


#### Topics:

* SAFETY_NET : it is possible to override the default safety net strategy, as you can see in the [usecase module](apps/example/src/usecase.module.ts) :

```typescript
    {
      provide: SAFETY_NET,
      useClass: CustomSafetyNet, // here, you can provide your custom strategy
    },
```