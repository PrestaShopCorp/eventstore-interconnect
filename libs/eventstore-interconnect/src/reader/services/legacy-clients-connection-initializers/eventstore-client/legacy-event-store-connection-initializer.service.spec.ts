import { Test, TestingModule } from '@nestjs/testing';
import { LegacyEventStoreConnectionInitializerService } from './legacy-event-store-connection-initializer.service';
import { Logger } from 'nestjs-pino-stackdriver';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';

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
        LegacyEventStoreConnectionInitializerService,
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

    service = module.get<LegacyEventStoreConnectionInitializerService>(
      LegacyEventStoreConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
