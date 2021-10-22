# EventstoreInterconnect

## Aim

The aim of this project is to provide a lib able to interconnect 2 eventstores, that have 2 different versions. These version are : v5.0.1 and v21.2.0 (also working with 2 eventstores with same version)

These usecases are listed here :
- [Client connects to 5.x, create/connect to persistent subscription, and write the events red on a v5.x stream](apps/v5-to-v5/README.md)

- [Client connects to v21.x, create/connect to persistent subscription, and write the events red on a v5.x stream](apps/v5-to-v21/README.md)

