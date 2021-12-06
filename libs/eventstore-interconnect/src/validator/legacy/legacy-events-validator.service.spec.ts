import { Test, TestingModule } from "@nestjs/testing";
import { LegacyEventsValidatorService } from "./legacy-events-validator.service";
import { ALLOWED_EVENTS } from "../../constants";
import { Dumb1Event } from "./mocks/dumb1.event";
import { Dumb2Event } from "./mocks/dumb2.event";
import { Dumb3Event } from "./mocks/dumb3.event";
import { getEvent } from "./mocks/helper";
import { InvalidEventError } from "../errors/invalid-event.error";
import { NotAllowedEventError } from "../errors/not-allowed-event.error";
import { SAFETY_NET } from "../../hooks/safety-net";
import spyOn = jest.spyOn;

describe('LegacyEventsValidatorService', () => {
  let service: LegacyEventsValidatorService;

  const safetynetMock = {
    cannotWriteEventHook: jest.fn(),
    invalidEventHook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyEventsValidatorService,
        {
          provide: SAFETY_NET,
          useValue: safetynetMock,
        },
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an InvalidEventError when event is invalid', async () => {
    expect.assertions(1);
    const classValidatorMock = jest.fn();
    require('class-validator').validate = classValidatorMock;
    classValidatorMock.mockResolvedValue([{}]);
    const expectedError: InvalidEventError = new InvalidEventError('');
    try {
      const invalidEvent = getEvent(false, 1);
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
      const validEvent = getEvent(true, 1);

      await service.validate(validEvent);
      throw evidenceValidateDidNotFail;
    } catch (error) {
      expect(error).toEqual(evidenceValidateDidNotFail);
    }
  });

  it('should throw an NotAllowedEventError when the event is not part of the allowed events', async () => {
    expect.assertions(1);
    const expectedError: NotAllowedEventError = new NotAllowedEventError({
      Dumb1Event,
      Dumb2Event,
      Dumb3Event,
    });
    try {
      const notAllowedEvent = getEvent(false, 5);
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
    const notAllowedEvent = getEvent(false, 5);

    try {
      await service.validate(notAllowedEvent);
    } catch (e) {
      // do nothing
    }

    expect(safetynetMock.invalidEventHook).toHaveBeenCalledWith(
      notAllowedEvent,
    );
  });
});
