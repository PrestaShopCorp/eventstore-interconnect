import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import { HttpDriverService } from './http-driver.service';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { Credentials } from '../../../interconnection-configuration';
import { SafetyNet } from '../../../safety-net';
import { Logger } from 'nestjs-pino-stackdriver';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';
import { setTimeout } from 'timers/promises';
import { FormattedEvent } from '../../../formatter';
import Mock = jest.Mock;
import spyOn = jest.spyOn;

describe('HttpDriverService', () => {
  let service: HttpDriverService;

  const esNodeConnection: EventStoreNodeConnection = {
    appendToStream: jest.fn(),
  } as any as EventStoreNodeConnection;
  const credentials: Credentials = { username: '', password: '' };
  const safetyNet: SafetyNet = { hook: jest.fn() } as any as SafetyNet;
  const logger: Logger = { error: jest.fn() } as any as Logger;

  const eventId = 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab';

  const event: FormattedEvent = {
    contentType: 'application/json',
    type: '',
    streamId: 'a',
    eventId: eventId,
    data: { toto: 123 },
    metadata: {},
  };

  beforeEach(async () => {
    service = new HttpDriverService(
      esNodeConnection,
      credentials,
      safetyNet,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should transmit write event command to the legacy client when writing event', async () => {
    await service.writeEvent(event);

    expect(esNodeConnection.appendToStream).toHaveBeenCalled();
  });

  it('should transmit the eventId for idempotency when writing event', async () => {
    await service.writeEvent(event);

    const callerArgs = (esNodeConnection.appendToStream as Mock).mock.calls[0];
    expect(callerArgs[0]).toEqual('a');
    expect(callerArgs[1]).toEqual(ExpectedVersion.Any);
    expect(callerArgs[2].eventId).toEqual(eventId);
  });

  it('should use the esNodeConnection to write event when handling the event', async () => {
    spyOn(esNodeConnection, 'appendToStream');

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    await service.writeEvent(event);

    expect(esNodeConnection.appendToStream).toHaveBeenCalled();
  });

  it('should trigger the safety net hook in case of failure when writing event', async () => {
    spyOn(esNodeConnection, 'appendToStream').mockImplementation(() => {
      throw Error();
    });
    spyOn(safetyNet, 'cannotWriteEventHook');

    await service.writeEvent(event);

    expect(safetyNet.cannotWriteEventHook).toHaveBeenCalled();
  });

  it('should trigger safety net hook when write event timed out', async () => {
    jest.useFakeTimers();
    spyOn(global, 'setTimeout');
    spyOn(safetyNet, 'cannotWriteEventHook');

    spyOn(esNodeConnection, 'appendToStream').mockImplementation(
      async (): Promise<any> => {
        return await setTimeout(EVENT_WRITER_TIMEOUT_IN_MS * 2);
      },
    );

    service.writeEvent(event);

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(global.setTimeout).toHaveBeenCalledTimes(1);
    expect(global.setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      EVENT_WRITER_TIMEOUT_IN_MS,
    );
    expect(safetyNet.cannotWriteEventHook).toHaveBeenCalledWith(event, false);
  });
});
