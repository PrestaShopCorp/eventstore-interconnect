import { HttpReaderService } from "./http-reader.service";
import { Logger } from '@nestjs/common';
import {
  IEventStorePersistentSubscriptionConfig
} from "nestjs-geteventstore-legacy/dist/interfaces/subscription.interface";
import { EventHandler } from "../../../event-handler";
import { ConnectionConfiguration } from "../../../interconnection-configuration";
import {
  HttpClientsConnectionInitializer,
  TCPEventstoreClientsConnectionInitializer
} from "../../../connections-initializers";
import spyOn = jest.spyOn;

describe('HttpReaderService', () => {
  let service: HttpReaderService;

  const intercoConf: ConnectionConfiguration = {
    tcp: {
      host: 'popo',
      port: 1234,
    },
    http: {
      host: 'popo',
      port: 1234,
    },
    credentials: {
      username: '',
      password: '',
    },
  };

  const persubConnectionSpy = jest.fn();
  const eventstoreClientsConnectionInitializer: TCPEventstoreClientsConnectionInitializer =
    {
      init: jest.fn(),
      getConnectedClient: () => {
        return { connectToPersistentSubscription: persubConnectionSpy };
      },
    } as any as TCPEventstoreClientsConnectionInitializer;
  const eventHandlerMock: EventHandler = {
    handle: () => {
      return { catch: jest.fn() };
    },
  } as any as EventHandler;
  const logger: Logger = { log: jest.fn() } as any as Logger;

  const subscriptions: IEventStorePersistentSubscriptionConfig[] = [
    {
      autoAck: true,
      bufferSize: 1,
      group: 'eee',
      onSubscriptionDropped: () => {},
      onSubscriptionStart: () => {},
      options: {},
      stream: 'eded',
    },
    {
      autoAck: true,
      bufferSize: 2,
      group: 'rrr',
      onSubscriptionDropped: () => {},
      onSubscriptionStart: () => {},
      options: {},
      stream: 'tttt',
    },
  ];

  const persubAssertSpy = jest.fn();
  const legacyHttpClientsConnectionInitializer: HttpClientsConnectionInitializer =
    {
      init: jest.fn(),
      getHttpClient: () => {
        return {
          persistentSubscriptions: {
            assert: persubAssertSpy,
          },
        };
      },
    } as any as HttpClientsConnectionInitializer;

  beforeEach(async () => {
    service = new HttpReaderService(
      intercoConf,
      subscriptions,
      eventHandlerMock,
      legacyHttpClientsConnectionInitializer,
      eventstoreClientsConnectionInitializer,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should upsert each subscriptions at module init', async () => {
    await service.onModuleInit();

    expect(persubAssertSpy).toHaveBeenCalledTimes(2);
  });

  it('should connect to each asserted subscription at startup', async () => {
    await service.onModuleInit();

    expect(persubConnectionSpy).toHaveBeenCalledTimes(2);
  });

  it(`should handle the event when a event appears`, async () => {
    spyOn(eventHandlerMock, 'handle');
    await service.onModuleInit();

    const method = persubConnectionSpy.mock.calls[0][2];

    await method(
      {
        acknowledge: jest.fn(),
      },
      {},
    );

    expect(eventHandlerMock.handle).toHaveBeenCalled();
  });
});
