import { Test, TestingModule } from '@nestjs/testing';
import { GrpcConnectionInitializerService } from './grpc-connection-initializer.service';
import {
  EVENTSTORE_DB_CLIENT,
  INTERCONNECT_CONFIGURATION,
} from '../../constants';
import { InterconnectionConfiguration } from '../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { EVENTSTORE_CONNECTION_GUARD } from '../../connections-guards';

describe('GrpcConnectionInitializerService', () => {
  let service: GrpcConnectionInitializerService;

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
        GrpcConnectionInitializerService,
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

    service = module.get<GrpcConnectionInitializerService>(
      GrpcConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start connection on init', async () => {
    await service.init();

    expect(esClientMock.connectionString).toHaveBeenCalledWith(
      'destConnectionString',
    );
  });

  it('should start to ping connection at init', async () => {
    await service.init();

    expect(esConnectionGuardMock.startConnectionLinkPinger).toHaveBeenCalled();
  });
});
