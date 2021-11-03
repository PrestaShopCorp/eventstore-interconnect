import { InterconnectionHandler } from './interconnection.handler';
import { Driver, EVENT_WRITER_TIMEOUT_IN_MS, SafetyNet } from '../index';
import { Logger } from 'nestjs-pino-stackdriver';
import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
} from 'nestjs-geteventstore-legacy';
import spyOn = jest.spyOn;

class CategoriesSyncEndedEvent extends EventStoreAcknowledgeableEvent {
  constructor(data: any, options?: EventOptionsType) {
    super(data, options);
    this.data = data;
  }
}

class Wrapper extends InterconnectionHandler<CategoriesSyncEndedEvent> {
  constructor(driver: Driver, safetyNet: SafetyNet, logger: Logger) {
    super(driver, safetyNet, logger);
  }

  public validateEventAndDatasDto(event: CategoriesSyncEndedEvent) {}
}

describe('InterconnectionHandler', () => {
  let handler: Wrapper;

  const safetyNet: SafetyNet = { hook: jest.fn() };
  const driver: Driver = { writeEvent: jest.fn() };
  const logger: Logger = { error: jest.fn(), log: jest.fn() } as any as Logger;

  let options: EventOptionsType;
  let event: CategoriesSyncEndedEvent;

  beforeEach(() => {
    handler = new Wrapper(driver, safetyNet, logger);
    options = {
      eventNumber: 0,
      originalEventId: '',
      eventStreamId: 'test',
    };
    event = new CategoriesSyncEndedEvent(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should use the driver to write event when handling the event', async () => {
    spyOn(driver, 'writeEvent').mockResolvedValue(true);

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    await handler.handle(event);

    expect(driver.writeEvent).toHaveBeenCalled();
  });

  it('should trigger the safety net hook in case of failure when writing event', async () => {
    spyOn(driver, 'writeEvent').mockImplementation(() => {
      throw Error();
    });
    spyOn(safetyNet, 'hook');

    await handler.handle(event);

    expect(safetyNet.hook).toHaveBeenCalled();
  });

  it('should trigger safety net hook when write event timed out', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    spyOn(driver, 'writeEvent').mockImplementation(async () => {
      setTimeout(() => null, EVENT_WRITER_TIMEOUT_IN_MS * 2);
    });
    spyOn(safetyNet, 'hook');

    await handler.handle(event);

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(safetyNet.hook).toHaveBeenCalled();
  });

  it('should check the validity of the events args when handling one', () => {
    spyOn(handler, 'validateEventAndDatasDto');

    handler.handle(event);

    expect(handler.validateEventAndDatasDto).toHaveBeenCalled();
  });
});
