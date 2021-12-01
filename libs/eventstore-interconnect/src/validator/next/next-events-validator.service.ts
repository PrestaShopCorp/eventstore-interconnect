import { Inject, Injectable } from '@nestjs/common';
import { ALLOWED_EVENTS } from '../../constants';
import { validate, ValidationError } from 'class-validator';
import { InvalidEventError } from '../errors/invalid-event.error';
import { NotAllowedEventError } from '../errors/not-allowed-event.error';
import { Validator } from '../validator';
import { SAFETY_NET, SafetyNet } from '../../safety-net';
import { plainToClass } from 'class-transformer';

@Injectable()
export class NextEventsValidatorService implements Validator {
  constructor(
    @Inject(ALLOWED_EVENTS)
    private readonly allowedEvents: any,
    @Inject(SAFETY_NET)
    private readonly safetyNet: SafetyNet,
  ) {}

  public async validate(event: any): Promise<void> {
    const eventInstance = this.tryToInstantiateEvent(event.event);

    const concatErrors: ValidationError[] = await validate(eventInstance);
    if (concatErrors.length > 0) {
      this.safetyNet.invalidEventHook(event);
      throw new InvalidEventError(JSON.stringify(concatErrors));
    }
  }

  private tryToInstantiateEvent(event: any): any {
    try {
      const instance = new this.allowedEvents[event.type](event.data);
      return plainToClass(this.allowedEvents[event.type], instance);
    } catch (e) {
      this.safetyNet.invalidEventHook(event);
      throw new NotAllowedEventError(this.allowedEvents);
    }
  }
}
