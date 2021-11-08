import { Test, TestingModule } from '@nestjs/testing';
import { LegacyEventsValidatorService } from './legacy-events-validator.service';
import { ALLOWED_EVENTS } from '../../../../constants';
import { Dumb1Event } from './mocks/dumb1.event';
import { Dumb2Event } from './mocks/dumb2.event';
import { Dumb3Event } from './mocks/dumb3.event';
import { ResolvedEvent } from 'node-eventstore-client';
import { getEvent } from './mocks/helper';
import { InvalidEventError } from '../errors/invalid-event.error';
import { NotAllowedEventError } from '../errors/not-allowed-event.error';

describe('LegacyEventsValidatorService', () => {
  let service: LegacyEventsValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyEventsValidatorService,
        {
          provide: ALLOWED_EVENTS,
          useValue: {
            Dumb1Event,
            Dumb2Event,
            Dumb3Event,
          },
        },
      ],
    }).compile();

    service = module.get<LegacyEventsValidatorService>(
      LegacyEventsValidatorService,
    );
  });

  it('should throw an InvalidEventError when event is invalid', async () => {
    expect.assertions(1);
    const expectedError: InvalidEventError = new InvalidEventError('');
    try {
      const invalidEvent: ResolvedEvent = getEvent(false, 1);
      await service.validate(invalidEvent);
    } catch (e) {
      expect(e.message.indexOf(expectedError.message)).not.toEqual(-1);
    }
  });

  it('should throw no exception when event is valid', async () => {
    expect.assertions(1);
    const evidenceValidateDidNotFail = new Error("didn't throw");
    try {
      const validEvent: ResolvedEvent = getEvent(true, 1);
      await service.validate(validEvent);
      throw evidenceValidateDidNotFail;
    } catch (error) {
      expect(error).toEqual(evidenceValidateDidNotFail);
    }
  });

  it('should throw an NotAllowedEventError when the event is not part of the allowed events', async () => {
    expect.assertions(1);
    const expectedError: NotAllowedEventError = new NotAllowedEventError('', {
      Dumb1Event,
      Dumb2Event,
      Dumb3Event,
    });
    try {
      const notAllowedEvent: ResolvedEvent = getEvent(false, 5);
      await service.validate(notAllowedEvent);
    } catch (e) {
      expect(e).toEqual(expectedError);
    }
  });

  it('should return the validated event when event is valid', async () => {
    const validEvent: ResolvedEvent = getEvent(true, 1);

    const event = await service.validate(validEvent);

    expect(event.eventStreamId).toBeTruthy();
    expect(event).toBeTruthy();
  });
});
