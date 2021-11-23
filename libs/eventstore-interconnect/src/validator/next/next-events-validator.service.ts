import { Inject, Injectable } from '@nestjs/common';
import { ALLOWED_EVENTS } from '../../constants';
import { validate, ValidationError } from 'class-validator';
import { InvalidEventError } from '../errors/invalid-event.error';
import { NotAllowedEventError } from '../errors/not-allowed-event.error';
import { Validator } from '../validator';

@Injectable()
export class NextEventsValidatorService implements Validator {
  constructor(
    @Inject(ALLOWED_EVENTS)
    private readonly allowedEvents: any,
  ) {}

  public async validate(event: any): Promise<void> {
    const eventInstance = this.tryToInstantiateEvent(event.event);

    const concatErrors: ValidationError[] = await validate(eventInstance);
    if (concatErrors.length > 0) {
      throw new InvalidEventError(JSON.stringify(concatErrors));
    }
  }

  private tryToInstantiateEvent(event: any): any {
    try {
      return new this.allowedEvents[event.type](event.data);
    } catch (e) {
      throw new NotAllowedEventError(this.allowedEvents);
    }
  }
}