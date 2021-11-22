export class NotAllowedEventError extends Error {
  constructor(allowedEvents: any) {
    super(`The event is not one of ${Object.keys(allowedEvents)}`);
  }
}
