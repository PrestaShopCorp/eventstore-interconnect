import { Inject, Injectable } from '@nestjs/common';
import { ALLOWED_EVENTS } from '../../../../constants';
import { validate, ValidationError } from 'class-validator';
import { InvalidEventError } from '../errors/invalid-event.error';
import { NotAllowedEventError } from '../errors/not-allowed-event.error';
import { Validator } from '../validator';

@Injectable()
export class LegacyEventsValidatorService implements Validator {
  constructor(
    @Inject(ALLOWED_EVENTS)
    private readonly allowedEvents: any,
  ) {}

  public async validate(eventAsPayload: any): Promise<any> {
    const event = JSON.parse(eventAsPayload.event.data.toString());
    const eventInstance = this.tryToInstanciateEvent(
      eventAsPayload,
      event.data,
    );

    const concatErrors: ValidationError[] = await validate(eventInstance);
    if (concatErrors.length > 0) {
      throw new InvalidEventError(JSON.stringify(concatErrors));
    }

    eventInstance.eventStreamId = eventAsPayload.originalStreamId;
    return eventInstance;
  }

  private tryToInstanciateEvent(eventAsPayload: any, data) {
    try {
      return new this.allowedEvents[eventAsPayload.event.eventType](data);
    } catch (e) {
      throw new NotAllowedEventError(e.message, this.allowedEvents);
    }
  }
}
