import { Test, TestingModule } from '@nestjs/testing';
import { NextConnectionInitializerService } from './next-connection-initializer.service';
import {
  EVENTSTORE_DB_CLIENT,
  INTERCONNECT_CONFIGURATION,
} from '../../../../constants';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { EVENTSTORE_CONNECTION_GUARD } from '../../../../connections-guards';

describe('NextConnectionInitializerService', () => {
  let service: NextConnectionInitializerService;

  const loggerMock = {
    log: jest.fn(),
  };

  const esConnectionGuardMock = {
    startConnectionLinkPinger: jest.fn(),
  };

  const intercoConf: InterconnectionConfiguration = {
    destination: {
      credentials: {
        username: '',
        password: '',
      },
      connectionString: 'destConnectionString',
    },
    source: {
      credentials: {
        username: '',
        password: '',
      },
    },
  };

  const esClientMock = {
    connectionString: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NextConnectionInitializerService,
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
          useValue: esConnectionGuardMock,
        },
        {
          provide: EVENTSTORE_DB_CLIENT,
          useValue: esClientMock,
        },
      ],
    }).compile();

    service = module.get<NextConnectionInitializerService>(
      NextConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start connection on module init', async () => {
    await service.onModuleInit();

    expect(esClientMock.connectionString).toHaveBeenCalledWith(
      'destConnectionString',
    );
  });

  it('should start to ping connection at module init', async () => {
    await service.onModuleInit();

    expect(esConnectionGuardMock.startConnectionLinkPinger).toHaveBeenCalled();
  });
});
