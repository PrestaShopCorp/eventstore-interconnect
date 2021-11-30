# Major evlolutions of the project

### 1.0.25
- Connections initialized on module init (hooked to lifecycle)
- Events are copied exactly as they are
- metadata enriched with event Id, stream name, and event type

### 1.0.24
update naming of the connection name for legacy event store

### 1.0.23
- Adding a custom strategy for invalid event handling
- the name of te connection is always the same

### 1.0.22
On this version, seperation of concerns about the event handling :
- errors are emmitted when event is invalid, or not allowed, so then we can catch them with a general filter
- the default strategy is to be given directly in the conf of the module
- bug fixes

### 1.0.21
On this version, more stability, more errors when problems appends, like connection issue.
Improvement of the example : it's now easy to copy paste what is needed to run the example, all is more explicit and we only have to connect to the correct interface, write the event we want and check that it works.

