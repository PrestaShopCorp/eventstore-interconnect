import { GrpcReaderService } from './grpc-reader.service';
import { Logger } from 'nestjs-pino-stackdriver';
import { EventHandler } from '../../../event-handler';
import spyOn = jest.spyOn;
import { InterconnectionConfiguration } from '../../../interconnection-configuration';
import { PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE } from 'nestjs-geteventstore-next/dist/event-store/services/errors.constant';

describe('GrpcReaderService', () => {
  let service: GrpcReaderService;

  const eventHandlerMock: EventHandler = {
    handle: jest.fn(),
  } as any as EventHandler;

  const logger = { log: jest.fn() } as any as Logger;

  const connectionClientMock = {
    connectionString: jest.fn(),
  };

  const eventstoreClientMock = {
    getStreamMetadata: jest.fn(),
    createPersistentSubscription: jest.fn(),
    connectToPersistentSubscription: jest.fn(),
    updatePersistentSubscription: jest.fn(),
  };

  const config: InterconnectionConfiguration = {
    destination: {
      credentials: { password: '', username: '' },
      connectionString: 'titi',
    },
    source: {
      connectionString: 'tutu',
      credentials: { password: '', username: '' },
    },
  };

  beforeEach(async () => {
    service = new GrpcReaderService(
      config,
      eventHandlerMock,
      { username: '', password: '' },
      [
        {
          stream: '1',
          group: '1g',
          optionsForConnection: {},
          settingsForCreation: {},
        },
        {
          stream: '2',
          group: '2g',
          optionsForConnection: {},
          settingsForCreation: {},
        },
      ],
      logger,
      connectionClientMock,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should init a connection on source eventstore on module init', async () => {
    jest
      .spyOn(connectionClientMock, 'connectionString')
      .mockReturnValue(eventstoreClientMock);
    jest
      .spyOn(eventstoreClientMock, 'getStreamMetadata')
      .mockResolvedValue(null);
    spyOn(
      eventstoreClientMock,
      'connectToPersistentSubscription',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(connectionClientMock.connectionString).toHaveBeenCalledWith('tutu');
  });

  it('should check if the connection on source eventstore is ok on module init', async () => {
    jest
      .spyOn(connectionClientMock, 'connectionString')
      .mockReturnValue(eventstoreClientMock);
    jest
      .spyOn(eventstoreClientMock, 'getStreamMetadata')
      .mockResolvedValue(null);
    spyOn(
      eventstoreClientMock,
      'connectToPersistentSubscription',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(eventstoreClientMock.getStreamMetadata).toHaveBeenCalledWith('$all');
  });

  it('should try to create each subscriptions at module init', async () => {
    jest
      .spyOn(connectionClientMock, 'connectionString')
      .mockReturnValue(eventstoreClientMock);
    jest
      .spyOn(eventstoreClientMock, 'getStreamMetadata')
      .mockResolvedValue(null);
    spyOn(service, 'upsertPersistantSubscription');
    spyOn(
      eventstoreClientMock,
      'connectToPersistentSubscription',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(
      eventstoreClientMock.createPersistentSubscription,
    ).toHaveBeenCalledTimes(2);
  });

  it('should update  each subscriptions at module init when they already exist', async () => {
    jest
      .spyOn(connectionClientMock, 'connectionString')
      .mockReturnValue(eventstoreClientMock);
    jest
      .spyOn(eventstoreClientMock, 'getStreamMetadata')
      .mockResolvedValue(null);
    jest
      .spyOn(eventstoreClientMock, 'createPersistentSubscription')
      .mockImplementation(() => {
        const error: Error = new Error();
        error['code'] = PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE;
        throw error;
      });
    spyOn(service, 'upsertPersistantSubscription');
    spyOn(
      eventstoreClientMock,
      'connectToPersistentSubscription',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(
      eventstoreClientMock.updatePersistentSubscription,
    ).toHaveBeenCalledTimes(2);
  });
});
