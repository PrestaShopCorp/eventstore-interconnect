import { GrpcReaderService } from './grpc-reader.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { ANY } from 'nestjs-geteventstore-next';
import { EventStoreService } from './event-store.service';
import { Driver } from '../../../driver';
import { Validator } from '../validator/validator';
import { Logger } from 'nestjs-pino-stackdriver';
import spyOn = jest.spyOn;

describe('GrpcReaderService', () => {
  let service: GrpcReaderService;

  const eventStoreService: EventStoreService = {
    startWithOnEvent: jest.fn(),
  } as any as EventStoreService;
  const client: Client = { appendToStream: jest.fn() } as any as Client;
  const driver: Driver = { writeEvent: jest.fn() } as any as Driver;
  const validatorService: Validator = {
    validate: jest.fn(),
  } as any as Validator;
  const logger: Logger = { appendToStream: jest.fn() } as any as Logger;

  beforeEach(async () => {
    service = new GrpcReaderService(
      eventStoreService,
      client,
      driver,
      validatorService,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should upsert subscriptions at module init', async () => {
    spyOn(service, 'upsertPersistantSubscription');

    await service.onModuleInit();

    expect(service.upsertPersistantSubscription).toHaveBeenCalled();
  });

  it('should call the eventstore service for starting with the given onEvent callback', async () => {
    spyOn(eventStoreService, 'startWithOnEvent');

    await service.upsertPersistantSubscription();

    expect(eventStoreService.startWithOnEvent).toHaveBeenCalled();
  });

  it('should transmit write order to client with good options when writing valid event', async () => {
    expect.assertions(1);
    spyOn(validatorService, 'validate').mockReturnValue({
      eventStreamId: undefined,
    });
    spyOn(driver, 'writeEvent');
    spyOn(eventStoreService, 'startWithOnEvent').mockImplementation(
      async (onEventCallBack: (event: any) => void): Promise<void> => {
        await onEventCallBack({ event: { streamId: 'dumb' } });
        expect(driver.writeEvent).toHaveBeenCalled();
      },
    );

    await service.upsertPersistantSubscription();
  });

  it('should throw an error when writing an invalid event', async () => {
    expect.assertions(1);
    spyOn(validatorService, 'validate').mockReturnValue({
      eventStreamId: undefined,
    });
    spyOn(driver, 'writeEvent');
    spyOn(eventStoreService, 'startWithOnEvent').mockImplementation(
      async (onEventCallBack: (event: any) => void): Promise<void> => {
        try {
          await onEventCallBack({});
        } catch (e) {
          expect(e).toBeTruthy();
        }
      },
    );

    await service.upsertPersistantSubscription();
  });
});
