export class InvalidEventError extends Error {
  constructor(eventAsPayload: any, message: string) {
    super(
      `The event (${JSON.stringify(
        eventAsPayload,
      )}) is invalid. Details: ${message}`,
    );
  }
}
