import { GrpcDriverService } from "./grpc-driver.service";
import { ANY } from "nestjs-geteventstore-next";
import { EVENT_WRITER_TIMEOUT_IN_MS } from "../../../constants";
import { Logger } from "nestjs-pino-stackdriver";
import { ConnectionConfiguration, Credentials } from "../../../interconnection-configuration";
import { SafetyNet } from "../../../safety-net";
import { setTimeout } from "timers/promises";
import { FormattedEvent } from "../../../formatter";
import spyOn = jest.spyOn;

describe('GrpcDriverService', () => {
  let driver: GrpcDriverService;

  const connectionInitializer = {
    init: jest.fn(),
    getConnectedClient: jest.fn(),
  };

  const credentials: Credentials = {
    username: '',
    password: '',
  };
  const safetyNet: SafetyNet = {
    hook: jest.fn(),
    cannotWriteEventHook: jest.fn(),
  } as any as SafetyNet;
  const logger: Logger = { error: jest.fn(), log: jest.fn() } as any as Logger;

  const event: FormattedEvent = {
    data: {},
    metadata: {
      eventStreamId: 'test',
      eventType: 'toto',
      eventId: 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab',
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
    driver = new GrpcDriverService(
      connectionConf,
      connectionInitializer,
      credentials,
      safetyNet,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should initialize a grpc connection at module init', async () => {
    await driver.onModuleInit();

    expect(connectionInitializer.init).toHaveBeenCalled();
  });

  it('should transmit write order to client with good options when writing event', async () => {
    const appendedToStreamSpy = jest.fn();
    spyOn(connectionInitializer, 'getConnectedClient').mockReturnValue({
      appendToStream: appendedToStreamSpy,
    });

    await driver.writeEvent(event);

    expect(appendedToStreamSpy).toHaveBeenCalled();
  });

  it('should give the event Id for idempotency when writing event', async () => {
    const appentToStreamSpy = jest.fn();
    spyOn(connectionInitializer, 'getConnectedClient').mockReturnValue({
      appendToStream: appentToStreamSpy,
    });

    await driver.writeEvent(event);

    expect(appentToStreamSpy).toHaveBeenCalledWith(
      'test',

      {
        contentType: 'application/json',
        data: {},
        id: event.metadata.eventId,
        metadata: {
          eventId: event.metadata.eventId,
          eventType: event.metadata.eventType,
          eventStreamId: event.metadata.eventStreamId,
        },
        type: event.metadata.eventType,
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
    spyOn(connectionInitializer, 'getConnectedClient').mockReturnValue({
      appendToStream: () => {
        throw Error();
      },
    });

    spyOn(safetyNet, 'cannotWriteEventHook');

    await driver.writeEvent(event);

    expect(safetyNet.cannotWriteEventHook).toHaveBeenCalled();
  });

  it('should trigger safety net hook when write event timed out', async () => {
    jest.useFakeTimers('legacy');
    jest.spyOn(global, 'setTimeout');

    spyOn(connectionInitializer, 'getConnectedClient').mockReturnValue({
      appendToStream: () => {
        setTimeout(EVENT_WRITER_TIMEOUT_IN_MS + 1000);
      },
    });

    driver.writeEvent(event).then(() => {
      // Do nothing
    });
    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(safetyNet.cannotWriteEventHook).toHaveBeenCalledWith(event);
    jest.runAllTimers();
  });
});
