export class NotAllowedEventError extends Error {
  constructor(message: string, allowedEvents: any) {
    super(`The event is not one of ${Object.keys(allowedEvents)}`);
  }
}
