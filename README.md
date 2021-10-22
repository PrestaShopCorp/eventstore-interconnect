# EventstoreInterconnect

## Aim

The aim of this project is to provide a lib able to interconnect 2 eventstores, that have 2 different versions. These version are : v5.0.1 and v21.2.0

These usecases are listed here :
- client connects to v21.x, create/connect to persistent subscription, and write the events red on a v5.x stream


### Usecase1 (v5 -> v5):
[Usecase 1 documentation](apps/v5-to-v5/README.md)
