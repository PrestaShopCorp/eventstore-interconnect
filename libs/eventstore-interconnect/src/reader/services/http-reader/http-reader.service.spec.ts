import { HttpReaderService } from './http-reader.service';
import {
  EventAppearedCallback,
  EventStoreNodeConnection,
  EventStorePersistentSubscription,
} from 'node-eventstore-client';
import { Driver } from '../../../driver';
import { Validator } from '../validator/validator';
import { Logger } from 'nestjs-pino-stackdriver';
import { HTTPClient } from 'geteventstore-promise';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import spyOn = jest.spyOn;

describe('HttpReaderService', () => {
  let service: HttpReaderService;

  const client: HTTPClient = {
    persistentSubscriptions: { assert: jest.fn() },
  } as any as HTTPClient;
  const driver: Driver = { writeEvent: jest.fn() } as any as Driver;
  const validatorService: Validator = {
    validate: jest.fn(),
  } as any as Validator;
  const logger: Logger = { log: jest.fn() } as any as Logger;

  const esNodeConnection: EventStoreNodeConnection = {
    connectToPersistentSubscription: jest.fn(),
  } as any as EventStoreNodeConnection;

  const eventId = 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab';

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
      driver,
      validatorService,
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

  it('should validate event when one is written on persistent subscription', async () => {
    expect.assertions(1);
    spyOn(validatorService, 'validate');

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
        expect(validatorService.validate).toHaveBeenCalled();
      },
    );

    await service.upsertPersistantSubscription();
  });

  it(`should write each valid event when it's red on persistent subscription`, async () => {
    expect.assertions(1);
    spyOn(validatorService, 'validate').mockReturnValue({ id: 'tutu' });
    spyOn(driver, 'writeEvent');

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
        expect(driver.writeEvent).toHaveBeenCalled();
      },
    );

    await service.upsertPersistantSubscription();
  });
});
