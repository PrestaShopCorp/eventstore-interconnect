import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as geteventstorePromise from 'geteventstore-promise';
import { createConnection } from 'node-eventstore-client';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../connections-guards';
import { CONNECTION_CONFIGURATION } from '../../../constants';
import { ConnectionConfiguration } from '../../../model';
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
          provide: Logger,
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
