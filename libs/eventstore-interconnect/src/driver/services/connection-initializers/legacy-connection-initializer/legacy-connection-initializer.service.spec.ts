import { Test, TestingModule } from '@nestjs/testing';
import { LegacyConnectionInitializerService } from './legacy-connection-initializer.service';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';
import {
  ConnectionGuard,
  EVENTSTORE_CONNECTION_GUARD,
} from '../../../../connections-guards';
import { createConnection } from 'node-eventstore-client';
import * as geteventstorePromise from 'geteventstore-promise';

jest.mock('geteventstore-promise');
jest.mock('node-eventstore-client');

describe('LegacyConnectionInitializerService', () => {
  let service: LegacyConnectionInitializerService;

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
    checkTcpConnection: jest.fn(),
  } as ConnectionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyConnectionInitializerService,
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

    service = module.get<LegacyConnectionInitializerService>(
      LegacyConnectionInitializerService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check the connection is ok on module init', async () => {
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

    await service.onModuleInit();

    expect(connectionGuardMock.checkTcpConnection).toHaveBeenCalled();
  });
});
