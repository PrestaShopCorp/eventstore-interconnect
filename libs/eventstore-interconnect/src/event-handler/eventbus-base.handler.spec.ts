import { EventbusBaseHandler } from './eventbus-base.handler';
import { Driver, SafetyNet } from '../index';
import { Logger } from '@nestjs/common';

class Wrapper extends EventbusBaseHandler<any> {
  constructor(driver: Driver, safetyNet: SafetyNet, logger: Logger) {
    super(driver, safetyNet, logger);
  }
}

describe('EventbusBaseHandler', () => {
  let handler: Wrapper;

  const safetyNet: SafetyNet = { hook: jest.fn() };
  const driver: Driver = { writeEvent: jest.fn() };
  const logger: Logger = new Logger();

  beforeEach(() => {
    handler = new Wrapper(driver, safetyNet, logger);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });
});
