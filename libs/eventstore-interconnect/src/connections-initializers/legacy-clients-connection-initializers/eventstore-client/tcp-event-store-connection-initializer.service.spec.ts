import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionConfiguration } from '../../../model';
import { CONNECTION_CONFIGURATION, LOGGER } from '../../../constants';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../connections-guards';
import { createConnection } from 'node-eventstore-client';
import * as geteventstorePromise from 'geteventstore-promise';
import { TCPEventStoreConnectionInitializerService } from './tcp-event-store-connection-initializer.service';

jest.mock('geteventstore-promise');
jest.mock('node-eventstore-client');

describe('TCPEventStoreConnectionInitializerService', () => {
  let service: TCPEventStoreConnectionInitializerService;

  const loggerMock = {
    log: jest.fn(),
  };

  const connectionConf: ConnectionConfiguration = {
    credentials: {
      username: '',
      password: '',
    },
    tcp: {
      host: '',
      port: 123,
    },
    http: {
      host: '',
      port: 456,
    },
  };

  const connectionGuardMock = {
    startConnectionLinkPinger: jest.fn(),
  } as ConnectionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TCPEventStoreConnectionInitializerService,
        {
          provide: LOGGER,
          useValue: loggerMock,
        },
        {
          provide: CONNECTION_CONFIGURATION,
          useValue: connectionConf,
        },
        {
          provide: EVENTSTORE_CONNECTION_GUARD,
          useValue: connectionGuardMock,
        },
      ],
    }).compile();

    service = module.get<TCPEventStoreConnectionInitializerService>(
      TCPEventStoreConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check the connection is ok on initialization', async () => {
    (createConnection as any).mockImplementation(() => {
      return {
        connect: jest.fn(),
      };
    });
    (geteventstorePromise.HTTPClient as any).mockImplementation(() => {
      return {
        checkStreamExists: jest.fn(),
      };
    });

    await service.init();

    expect(connectionGuardMock.startConnectionLinkPinger).toHaveBeenCalled();
  });
});
