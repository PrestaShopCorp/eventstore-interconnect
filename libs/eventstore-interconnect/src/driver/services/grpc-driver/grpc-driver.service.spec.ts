import { GrpcDriverService } from './grpc-driver.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';
import { Logger } from 'nestjs-pino-stackdriver';
import { Credentials } from '../../../interconnection-configuration';
import { SafetyNet } from '../../../safety-net';
import spyOn = jest.spyOn;

describe('GrpcDriverService', () => {
  let driver: GrpcDriverService;

  const client: Client = { appendToStream: jest.fn() } as any as Client;
  const credentials: Credentials = {
    username: '',
    password: '',
  };
  const safetyNet: SafetyNet = {
    hook: jest.fn(),
  } as any as SafetyNet;
  const logger: Logger = { error: jest.fn(), log: jest.fn() } as any as Logger;

  const event = {
    data: {},
    metadata: {},
    eventStreamId: 'test',
    eventType: 'toto',
    eventId: 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab',
  };

  beforeEach(async () => {
    driver = new GrpcDriverService(client, credentials, safetyNet, logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should transmit write order to client with good options when writing event', async () => {
    await driver.writeEvent(event);

    expect(client.appendToStream).toHaveBeenCalled();
  });

  it('should give the event Id for idempotency when writing event', async () => {
    await driver.writeEvent(event);

    expect(client.appendToStream).toHaveBeenCalledWith(
      'test',

      {
        contentType: 'application/json',
        data: {},
        id: 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab',
        metadata: {},
        type: 'toto',
      },
      { expectedRevision: ANY, credentials },
    );
  });

  it('should use the driver to write event when handling the event', async () => {
    spyOn(driver, 'writeEvent');

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    await driver.writeEvent(event);

    expect(driver.writeEvent).toHaveBeenCalled();
  });

  it('should trigger the safety net hook in case of failure when writing event', async () => {
    spyOn(client, 'appendToStream').mockImplementation(
      async (): Promise<any> => {
        throw Error();
      },
    );
    spyOn(safetyNet, 'hook');

    await driver.writeEvent(event);

    expect(safetyNet.hook).toHaveBeenCalled();
  });

  it('should trigger safety net hook when write event timed out', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    spyOn(client, 'appendToStream').mockImplementation(
      async (): Promise<any> => {
        setTimeout(() => null, EVENT_WRITER_TIMEOUT_IN_MS * 2);
      },
    );
    spyOn(safetyNet, 'hook');

    await driver.writeEvent(event);

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(safetyNet.hook).toHaveBeenCalledWith(event);
  });
});
