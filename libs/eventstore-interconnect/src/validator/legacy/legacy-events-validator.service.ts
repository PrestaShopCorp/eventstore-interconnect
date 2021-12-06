import { Inject, Injectable } from '@nestjs/common';
import { ALLOWED_EVENTS } from '../../constants';
import { validate, ValidationError } from 'class-validator';
import { InvalidEventError } from '../errors/invalid-event.error';
import { NotAllowedEventError } from '../errors/not-allowed-event.error';
import { Validator } from '../validator';
import { SAFETY_NET, SafetyNet } from '../../hooks/safety-net';
import { plainToClass } from 'class-transformer';

@Injectable()
export class LegacyEventsValidatorService implements Validator {
  constructor(
    @Inject(ALLOWED_EVENTS)
    private readonly allowedEvents: any,
    @Inject(SAFETY_NET)
    private readonly safetyNet: SafetyNet,
  ) {}

  public async validate(eventAsPayload: any): Promise<void> {
    const datas = JSON.parse(eventAsPayload.event.data.toString());
    const eventInstance = this.tryToInstantiateEvent(eventAsPayload, datas);

    const concatErrors: ValidationError[] = await validate(eventInstance);

    if (concatErrors.length > 0) {
      this.safetyNet.invalidEventHook(eventAsPayload);
      throw new InvalidEventError(JSON.stringify(concatErrors));
    }
  }

  private tryToInstantiateEvent(eventAsPayload: any, data) {
    try {
      const instance = new this.allowedEvents[eventAsPayload.event.eventType](
        data,
      );
      return plainToClass(
        this.allowedEvents[eventAsPayload.event.eventType],
        instance,
      );
    } catch (e) {
      this.safetyNet.invalidEventHook(eventAsPayload);
      throw new NotAllowedEventError(this.allowedEvents);
    }
  }
}
