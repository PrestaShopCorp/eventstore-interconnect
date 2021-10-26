import { EventbusBaseHandler } from './eventbus-base.handler';
import { Driver, SafetyNet } from '../index';
import { Logger } from '@nestjs/common';

class Wrapper extends EventbusBaseHandler<any> {
  constructor(safetyNet: SafetyNet, driver: Driver, logger: Logger) {
    super(safetyNet, driver, logger);
  }
}

describe('EventbusBaseHandler', () => {
  let handler: Wrapper;

  const safetyNet: SafetyNet = { hook: jest.fn() };
  const driver: Driver = { writeEvent: jest.fn() };
  const logger: Logger = new Logger();

  beforeEach(() => {
    handler = new Wrapper(safetyNet, driver, logger);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });
});
