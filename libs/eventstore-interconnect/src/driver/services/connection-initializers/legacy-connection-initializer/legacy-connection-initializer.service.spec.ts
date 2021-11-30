import { Test, TestingModule } from '@nestjs/testing';
import { LegacyConnectionInitializerService } from './legacy-connection-initializer.service';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';

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
    },
    source: {
      credentials: {
        username: '',
        password: '',
      },
    },
  };

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
      ],
    }).compile();

    service = module.get<LegacyConnectionInitializerService>(
      LegacyConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
