import { Test, TestingModule } from '@nestjs/testing';
import { NextConnectionInitializerService } from './next-connection-initializer.service';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';
import { InterconnectionConfiguration } from '../../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';

describe('NextConnectionInitializerService', () => {
  let service: NextConnectionInitializerService;

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
        NextConnectionInitializerService,
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

    service = module.get<NextConnectionInitializerService>(
      NextConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
