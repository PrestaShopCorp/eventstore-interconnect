import { GrpcReaderService } from './grpc-reader.service';
import { Logger } from '@nestjs/common';
import { EventHandler } from '../../../event-handler';
import { ConnectionGuard } from '../../../connections-guards';
import spyOn = jest.spyOn;
import { ConnectionConfiguration } from '../../../model';
import { PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE } from '../constants';

describe('GrpcReaderService', () => {
  let service: GrpcReaderService;

  const eventHandlerMock: EventHandler = {
    handle: jest.fn(),
  } as any as EventHandler;

  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  } as any as Logger;

  const connectionClientMock = {
    connectionString: jest.fn(),
  };

  const connectionGuardMock = {
    startConnectionLinkPinger: jest.fn(),
  } as any as ConnectionGuard;

  const eventstoreClientMock = {
    listAllPersistentSubscriptions: jest.fn(),
    createPersistentSubscriptionToStream: jest.fn(),
    subscribeToPersistentSubscriptionToStream: jest.fn(),
    updatePersistentSubscriptionToStream: jest.fn(),
  };

  const connectionInitializerMock = {
    init: jest.fn(),
    getConnectedClient: jest.fn(),
  };

  const connectionConfig: ConnectionConfiguration = {
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
    service = new GrpcReaderService(
      connectionConfig,
      eventHandlerMock,
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
      connectionClientMock,
      connectionInitializerMock,
      connectionGuardMock,
      logger,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should start the eventstore connection pinger on module init', async () => {
    jest
      .spyOn(connectionInitializerMock, 'getConnectedClient')
      .mockReturnValue(eventstoreClientMock);
    spyOn(eventstoreClientMock, 'createPersistentSubscriptionToStream');
    spyOn(
      eventstoreClientMock,
      'subscribeToPersistentSubscriptionToStream',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(connectionInitializerMock.getConnectedClient).toHaveBeenCalled();
  });

  it('should check if the connection on source eventstore is ok on module init', async () => {
    jest
      .spyOn(connectionInitializerMock, 'getConnectedClient')
      .mockReturnValue(eventstoreClientMock);
    spyOn(
      eventstoreClientMock,
      'subscribeToPersistentSubscriptionToStream',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(connectionGuardMock.startConnectionLinkPinger).toHaveBeenCalled();
  });

  it('should try to create each subscriptions at module init', async () => {
    jest
      .spyOn(connectionInitializerMock, 'getConnectedClient')
      .mockReturnValue(eventstoreClientMock);
    jest
      .spyOn(eventstoreClientMock, 'listAllPersistentSubscriptions')
      .mockResolvedValue(null);
    spyOn(service, 'upsertPersistantSubscriptions');
    spyOn(
      eventstoreClientMock,
      'subscribeToPersistentSubscriptionToStream',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(
      eventstoreClientMock.createPersistentSubscriptionToStream,
    ).toHaveBeenCalledTimes(2);
  });

  it('should update  each subscriptions at module init when they already exist', async () => {
    jest
      .spyOn(connectionInitializerMock, 'getConnectedClient')
      .mockReturnValue(eventstoreClientMock);
    jest
      .spyOn(eventstoreClientMock, 'listAllPersistentSubscriptions')
      .mockResolvedValue(null);
    jest
      .spyOn(eventstoreClientMock, 'createPersistentSubscriptionToStream')
      .mockImplementation(() => {
        const error: Error = new Error();
        error['code'] = PERSISTENT_SUBSCRIPTION_ALREADY_EXIST_ERROR_CODE;
        throw error;
      });
    spyOn(service, 'upsertPersistantSubscriptions');
    spyOn(
      eventstoreClientMock,
      'subscribeToPersistentSubscriptionToStream',
    ).mockReturnValue({
      on: jest.fn(),
    });

    await service.onModuleInit();

    expect(
      eventstoreClientMock.updatePersistentSubscriptionToStream,
    ).toHaveBeenCalledTimes(2);
  });
});
