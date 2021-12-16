import { Test, TestingModule } from '@nestjs/testing';
import { NextEventsValidatorService } from './next-events-validator.service';
import { ALLOWED_EVENTS } from '../../constants';
import { Dumb1Event } from './mocks/dumb1.event';
import { Dumb2Event } from './mocks/dumb2.event';
import { Dumb3Event } from './mocks/dumb3.event';
import { ResolvedEvent } from 'node-eventstore-client';
import { getEvent } from './mocks/helper';
import { InvalidEventError } from '../errors/invalid-event.error';
import { NotAllowedEventError } from '../errors/not-allowed-event.error';
import { SAFETY_NET } from '../../safety-net';
import { ValidableMetadataEvent } from './mocks/validable-metadata.event';
import spyOn = jest.spyOn;

describe('NextEventsValidatorService', () => {
  let service: NextEventsValidatorService;

  const safetynetMock = {
    cannotWriteEventHook: jest.fn(),
    invalidEventHook: jest.fn(),
  };

  const allowedEvents = {
    Dumb1Event,
    Dumb2Event,
    Dumb3Event,
    ValidableMetadataEvent,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NextEventsValidatorService,
        {
          provide: SAFETY_NET,
          useValue: safetynetMock,
        },
        {
          provide: ALLOWED_EVENTS,
          useValue: allowedEvents,
        },
      ],
    }).compile();

    service = module.get<NextEventsValidatorService>(
      NextEventsValidatorService,
    );
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
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
    const classValidatorMock = jest.fn();
    require('class-validator').validate = classValidatorMock;
    classValidatorMock.mockResolvedValue([]);

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
    const expectedError: NotAllowedEventError = new NotAllowedEventError(
      allowedEvents,
    );
    try {
      const notAllowedEvent: ResolvedEvent = getEvent(false, 5);
      await service.validate(notAllowedEvent);
    } catch (e) {
      expect(e).toEqual(expectedError);
    }
  });

  it('should trigger the safety hook for invalid event when event is invalid', async () => {
    expect.assertions(1);
    const classValidatorMock = jest.fn();
    require('class-validator').validate = classValidatorMock;
    classValidatorMock.mockResolvedValue([{}]);
    spyOn(safetynetMock, 'invalidEventHook');

    const invalidEvent = getEvent(false, 1);
    try {
      await service.validate(invalidEvent);
    } catch (e) {
      // do nothing;
      expect(safetynetMock.invalidEventHook).toHaveBeenCalledWith(invalidEvent);
    }
  });

  it('should trigger the safety hook for invalid invent when event is not allowed', async () => {
    spyOn(safetynetMock, 'invalidEventHook');
    const classTransformerMock = jest.fn();
    require('class-transformer').plainToClass = classTransformerMock;
    classTransformerMock.mockImplementation(() => {
      throw Error();
    });
    const notAllowedEvent: ResolvedEvent = getEvent(false, 1);
    try {
      await service.validate(notAllowedEvent);
    } catch (e) {
      // do nothing
    }
    expect(safetynetMock.invalidEventHook.mock.calls[0][0].data).toEqual(
      notAllowedEvent.event.data,
    );
    expect(safetynetMock.invalidEventHook.mock.calls[0][0].metadata).toEqual(
      notAllowedEvent.event.metadata,
    );
  });

  it('should only validate the event data, not the metadata', async () => {
    const classTransformerMock = jest.fn();
    require('class-transformer').plainToClass = classTransformerMock;
    classTransformerMock.mockImplementation(() => {
      return {
        ...new ValidableMetadataEvent({}, { isOk: true }),
        metadata: { isOk: 123 },
      };
    });
    const classValidatorMock = jest.fn();
    require('class-validator').validate = classValidatorMock;
    classValidatorMock.mockResolvedValue([]);
    const validableMetadataEvent = {
      event: {
        data: {},
        metadata: {
          isOk: 123,
        },
        type: 'ValidableMetadataEvent',
      },
    };
    let errorRaised = false;
    try {
      await service.validate(validableMetadataEvent);
    } catch (e) {
      console.log('e : ', e);
      errorRaised = true;
    }

    expect(errorRaised).toBeFalsy();
  });
});
