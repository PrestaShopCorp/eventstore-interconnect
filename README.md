# EventstoreInterconnect

## Aim

The aim of this project is to provide a lib able to interconnect 2 eventstores, that have 2 different versions. These version are : v5.0.1 and v21.2.0 (also working with 2 eventstores with same version)

A usecase has been prepared in order to test the different possibilities :
- [Given a specific configuration](apps/usecase/README.md), the system should automaticcally detect the version of the source and dest eventstore, and connect to it. 

After that, it should automatically create/connect to subscriptions into the source, and write events into the destination one, after checking that the events are allowed and valid.
