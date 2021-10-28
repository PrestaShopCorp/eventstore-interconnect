import { EventbusBaseHandler } from './eventbus-base.handler';
import { Driver, EVENT_WRITER_TIMEOUT_IN_MS, SafetyNet } from '../index';
import { Logger } from '@nestjs/common';
import spyOn = jest.spyOn;

class Wrapper extends EventbusBaseHandler<any> {
  constructor(driver: Driver, safetyNet: SafetyNet, logger: Logger) {
    super(driver, safetyNet, logger);
  }
}

describe('EventbusBaseHandler', () => {
  let handler: Wrapper;

  const safetyNet: SafetyNet = { hook: jest.fn() };
  const driver: Driver = { writeEvent: jest.fn() };
  const logger: Logger = { error: jest.fn(), log: jest.fn() } as any as Logger;

  beforeEach(() => {
    handler = new Wrapper(driver, safetyNet, logger);
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

    await handler.handle({});

    expect(driver.writeEvent).toHaveBeenCalled();
  });

  it('should trigger the safety net hook in case of failure when writing event', async () => {
    spyOn(driver, 'writeEvent').mockImplementation(() => {
      throw Error();
    });
    spyOn(safetyNet, 'hook');

    await handler.handle({});

    expect(safetyNet.hook).toHaveBeenCalled();
  });

  it('should trigger safety net hook when write event timed out', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    spyOn(driver, 'writeEvent').mockImplementation(async () => {
      setTimeout(() => null, EVENT_WRITER_TIMEOUT_IN_MS * 2);
    });
    spyOn(safetyNet, 'hook');

    await handler.handle({});

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(safetyNet.hook).toHaveBeenCalled();
  });
});
