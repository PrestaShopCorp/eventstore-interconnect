import { Test, TestingModule } from "@nestjs/testing";
import { EventHandlerService } from "./event-handler.service";
import { VALIDATOR } from "../validator";
import { FORMATTER } from "../formatter/formatter";
import { DRIVER } from "../driver";
import { WRITER_HOOK } from "../hooks/writer-hook/writer-hook";

describe('EventHandlerService', () => {
  let service: EventHandlerService;

  const validatorServiceMock = {
    validate: jest.fn(),
  };

  const eventFormatterMock = {
    format: jest.fn(),
  };
  const driverMock = {
    writeEvent: jest.fn(),
  };

  const writerHookMock = {
    hook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventHandlerService,
        {
          provide: VALIDATOR,
          useValue: validatorServiceMock,
        },
        {
          provide: FORMATTER,
          useValue: eventFormatterMock,
        },
        {
          provide: DRIVER,
          useValue: driverMock,
        },
        {
          provide: WRITER_HOOK,
          useValue: writerHookMock,
        },
      ],
    }).compile();

    service = module.get<EventHandlerService>(EventHandlerService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should validate the next event when handling', async () => {
    const event = {};

    await service.handle(event);

    expect(validatorServiceMock.validate).toHaveBeenCalledWith(event);
  });

  it('should format the event when handling', async () => {
    const event = {};

    await service.handle(event);

    expect(eventFormatterMock.format).toHaveBeenCalledWith(event);
  });

  it('should write the formatted event', async () => {
    const formattedEvent = {
      id: 'toto',
    };

    eventFormatterMock.format.mockReturnValue(formattedEvent);

    await service.handle({});

    expect(driverMock.writeEvent).toHaveBeenCalledWith(formattedEvent);
  });

  it("should trigger writer hook when the event is valid", async () => {
    const formattedEvent = {
      id: 'toto',
    };

    eventFormatterMock.format.mockReturnValue(formattedEvent);

    await service.handle({});

    expect(writerHookMock.hook).toHaveBeenCalledWith(formattedEvent);
  });

  it("should not trigger writer hook when the event is invalid", async () => {
    const formattedEvent = {
      id: 'toto',
    };

    validatorServiceMock.validate.mockImplementation(() => {
      throw Error();
    });

    try {
      await service.handle({});
    } catch (e) {
      // Do nothing
    }

    expect(writerHookMock.hook).not.toHaveBeenCalledWith(formattedEvent);
  });
});
