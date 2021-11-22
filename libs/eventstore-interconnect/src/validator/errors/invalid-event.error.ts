export class InvalidEventError extends Error {
  constructor(message: string) {
    super(`The event is invalid. Details: ${message}`);
  }
}
