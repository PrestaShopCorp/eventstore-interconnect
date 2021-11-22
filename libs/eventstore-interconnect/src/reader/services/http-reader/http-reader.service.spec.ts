import { HttpReaderService } from './http-reader.service';
import {
  EventAppearedCallback,
  EventStoreNodeConnection,
  EventStorePersistentSubscription,
} from 'node-eventstore-client';
import { Driver } from '../../../driver';
import { Logger } from 'nestjs-pino-stackdriver';
import { HTTPClient } from 'geteventstore-promise';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import { EventHandler } from '../../../event-handler';
import spyOn = jest.spyOn;

describe('HttpReaderService', () => {
  let service: HttpReaderService;

  const client: HTTPClient = {
    persistentSubscriptions: { assert: jest.fn() },
  } as any as HTTPClient;
  const eventHandlerMock: EventHandler = {
    handle: jest.fn(),
  } as any as EventHandler;
  const logger: Logger = { log: jest.fn() } as any as Logger;

  const esNodeConnection: EventStoreNodeConnection = {
    connectToPersistentSubscription: jest.fn(),
  } as any as EventStoreNodeConnection;

  const subscriptions: IEventStorePersistentSubscriptionConfig[] = [
    {
      autoAck: true,
      bufferSize: 1,
      group: '',
      onSubscriptionDropped: () => {},
      onSubscriptionStart: () => {},
      options: {},
      stream: '',
    },
  ];

  beforeEach(async () => {
    service = new HttpReaderService(
      client,
      esNodeConnection,
      subscriptions,
      {
        username: '',
        password: '',
      },
      eventHandlerMock,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should upsert subscriptions when module init', () => {
    spyOn(service, 'upsertPersistantSubscription');

    service.onModuleInit();

    expect(service.upsertPersistantSubscription).toHaveBeenCalled();
  });

  it('should assert subscriptions at startup', async () => {
    spyOn(client.persistentSubscriptions, 'assert');

    await service.upsertPersistantSubscription();

    expect(client.persistentSubscriptions.assert).toHaveBeenCalled();
  });

  it('should connect to each asserted subscription at startup', async () => {
    spyOn(esNodeConnection, 'connectToPersistentSubscription');

    await service.upsertPersistantSubscription();

    expect(esNodeConnection.connectToPersistentSubscription).toHaveBeenCalled();
  });

  it(`should handle the event when a event appears`, async () => {
    expect.assertions(1);

    spyOn(
      esNodeConnection,
      'connectToPersistentSubscription',
    ).mockImplementation(
      async (
        stream: string,
        groupName: string,
        eventAppeared: EventAppearedCallback<EventStorePersistentSubscription>,
      ): Promise<any> => {
        await eventAppeared(
          {
            acknowledge(event: any): void {},
            fail(event: any, action: any, reason: string): void {},
            stop(): void {},
          },
          {
            isResolved: false,
            originalEventNumber: undefined,
            originalStreamId: '',
          },
        );
        expect(eventHandlerMock.handle).toHaveBeenCalled();
      },
    );

    await service.upsertPersistantSubscription();
  });
});
