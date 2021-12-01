import { Test, TestingModule } from '@nestjs/testing';
import { LegacyEventStoreConnectionInitializerService } from './legacy-event-store-connection-initializer.service';
import { Logger } from 'nestjs-pino-stackdriver';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../../connections-guards';
import { createConnection } from 'node-eventstore-client';
import * as geteventstorePromise from 'geteventstore-promise';

jest.mock('geteventstore-promise');
jest.mock('node-eventstore-client');

describe('LegacyEventStoreConnectionInitializerService', () => {
  let service: LegacyEventStoreConnectionInitializerService;

  const loggerMock = {
    log: jest.fn(),
  };

  const intercoConf: InterconnectionConfiguration = {
    destination: {
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
    },
    source: {
      credentials: {
        username: '',
        password: '',
      },
      tcp: {
        host: '',
        port: 456,
      },
      http: {
        host: '',
        port: 456,
      },
    },
  };

  const connectionGuardMock = {
    startConnectionLinkPinger: jest.fn(),
  } as ConnectionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyEventStoreConnectionInitializerService,
        {
          provide: Logger,
          useValue: loggerMock,
        },
        {
          provide: INTERCONNECT_CONFIGURATION,
          useValue: intercoConf,
        },
        {
          provide: EVENTSTORE_CONNECTION_GUARD,
          useValue: connectionGuardMock,
        },
      ],
    }).compile();

    service = module.get<LegacyEventStoreConnectionInitializerService>(
      LegacyEventStoreConnectionInitializerService,
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

    await service.initClient();

    expect(connectionGuardMock.startConnectionLinkPinger).toHaveBeenCalled();
  });
});
