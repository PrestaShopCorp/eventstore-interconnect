import { GrpcReaderService } from './grpc-reader.service';
import { Logger } from 'nestjs-pino-stackdriver';
import { EventHandler } from '../../../event-handler';
import spyOn = jest.spyOn;

describe('GrpcReaderService', () => {
  let service: GrpcReaderService;

  const eventHandlerMock: EventHandler = {
    handle: jest.fn(),
  } as any as EventHandler;
  const logger: Logger = { appendToStream: jest.fn() } as any as Logger;

  beforeEach(async () => {
    service = new GrpcReaderService(
      { destination: undefined, source: undefined },
      eventHandlerMock,
      { username: '', password: '' },
      [],
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

  // it('should call the eventstore service for starting with the given onEvent callback', async () => {
  //   spyOn(eventStoreService, 'init');
  //
  //   await service.upsertPersistantSubscription();
  //
  //   expect(eventStoreService.init).toHaveBeenCalled();
  // });
  //
  // it('should event to event handler when event appears', async () => {
  //   expect.assertions(1);
  //   spyOn(eventStoreService, 'init').mockImplementation(
  //     async (onEventCallBack: (event: any) => void): Promise<void> => {
  //       await onEventCallBack({ event: { streamId: 'dumb' } });
  //       expect(eventHandlerMock.handle).toHaveBeenCalled();
  //     },
  //   );
  //
  //   await service.upsertPersistantSubscription();
  // });
});
