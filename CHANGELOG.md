# Major evlolutions of the project

### 1.0.41
- Add debug logs switch feature. You can now enable or desable them by passing boolean in the configuration.

### 1.0.33
- fix a bug making the metadata to be validated whereas it shoud not

### 1.0.32
- improving logger (easily overridable and testable)

### 1.0.31
- improving logger (easily overridable)
- add debug log for guards again

### 1.0.30
- remove debug temporarily for guards

### 1.0.29
- improve documentation
- improve architecture and remove coupling with heavy third party libs

### 1.0.28
- fix issue with connection drop behavior
- add some formatting with logs

### 1.0.27
- logs are clearer
- arch is cleaned, some code duplication avoided

### 1.0.26
- New feature : Each $CONNECTION_LINK_CHECK_INTERVAL_IN_MS milliseconds, the connection to both source and destination
  will be checked. When the connection timeout, process will exit with code 1

### 1.0.25
- Connections initialized on module init (hooked to lifecycle)
- Events are copied exactly as they are
- metadata enriched with event Id, stream name, and event type
- aggressive timeout when connecting to event store at startup
- fixing nested validation when handling an event

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

