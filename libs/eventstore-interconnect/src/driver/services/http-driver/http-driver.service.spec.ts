import { ExpectedVersion } from "nestjs-geteventstore-legacy";
import { HttpDriverService } from "./http-driver.service";
import { createJsonEventData, EventStoreNodeConnection } from "node-eventstore-client";
import { ConnectionConfiguration, Credentials } from "../../../interconnection-configuration";
import { SafetyNet } from "../../../safety-net";
import { Logger } from '@nestjs/common';
import { EVENT_WRITER_TIMEOUT_IN_MS } from "../../../constants";
import { setTimeout } from "timers/promises";
import { FormattedEvent } from "../../../formatter";
import spyOn = jest.spyOn;

describe('HttpDriverService', () => {
  let service: HttpDriverService;

  const connectionInitializerMock = {
    init: jest.fn(),
    getConnectedClient: jest.fn(),
  };
  const esNodeConnection: EventStoreNodeConnection = {
    appendToStream: jest.fn(),
  } as any as EventStoreNodeConnection;
  const credentials: Credentials = { username: '', password: '' };
  const safetyNet: SafetyNet = {
    hook: jest.fn(),
    cannotWriteEventHook: jest.fn(),
  } as any as SafetyNet;
  const logger: Logger = { log: jest.fn(), error: jest.fn() } as any as Logger;

  const eventId = 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab';

  const event: FormattedEvent = {
    data: { toto: 123 },
    metadata: {
      eventType: '',
      eventStreamId: 'a',
      eventId: eventId,
    },
  };

  const connectionConf: ConnectionConfiguration = {
    tcp: {
      port: 1234,
      host: 'toto',
    },
    http: {
      port: 1234,
      host: 'toto',
    },
    credentials: { username: '', password: '' },
  };

  beforeEach(async () => {
    service = new HttpDriverService(
      connectionConf,
      connectionInitializerMock,
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
    const appentToStreamSpy = jest.fn();
    spyOn(connectionInitializerMock, 'getConnectedClient').mockReturnValue({
      appendToStream: appentToStreamSpy,
    });
    await service.writeEvent(event);

    expect(appentToStreamSpy).toHaveBeenCalled();
  });

  it('should transmit the eventId for idempotency when writing event', async () => {
    const jsonFormattedEvent = createJsonEventData(
      event.metadata.eventId,
      event.data,
      event.metadata,
      event.metadata.eventType,
    );
    const appentToStreamSpy = jest.fn();
    spyOn(connectionInitializerMock, 'getConnectedClient').mockReturnValue({
      appendToStream: appentToStreamSpy,
    });

    await service.writeEvent(event);

    expect(appentToStreamSpy).toHaveBeenCalledWith(
      event.metadata.eventStreamId,
      ExpectedVersion.Any,
      jsonFormattedEvent,
      { password: '', username: '' },
    );
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

    service.writeEvent(event).then(() => {
      // Do nothing
    });

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(global.setTimeout).toHaveBeenCalledTimes(1);
    expect(global.setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      EVENT_WRITER_TIMEOUT_IN_MS,
    );
    expect(safetyNet.cannotWriteEventHook).toHaveBeenCalledWith(event);
  });
});
