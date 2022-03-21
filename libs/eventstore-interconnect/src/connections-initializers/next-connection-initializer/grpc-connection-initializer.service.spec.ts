import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EVENTSTORE_CONNECTION_GUARD } from '../../connections-guards';
import {
  CONNECTION_CONFIGURATION,
  EVENTSTORE_DB_CLIENT,
} from '../../constants';
import { ConnectionConfiguration } from '../../model';
import { GrpcConnectionInitializerService } from './grpc-connection-initializer.service';

describe('GrpcConnectionInitializerService', () => {
  let service: GrpcConnectionInitializerService;

  const loggerMock = {
    log: jest.fn(),
  };

  const esConnectionGuardMock = {
    startConnectionLinkPinger: jest.fn(),
  };

  const connectionConf: ConnectionConfiguration = {
    credentials: {
      username: '',
      password: '',
    },
    connectionString: 'destConnectionString',
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
          provide: CONNECTION_CONFIGURATION,
          useValue: connectionConf,
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
