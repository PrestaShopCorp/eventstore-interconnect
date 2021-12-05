import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino-stackdriver';
import { InterconnectionConfiguration } from '../../../interconnection-configuration';
import { INTERCONNECT_CONFIGURATION } from '../../../constants';
import { HttpClientConnectionInitializerService } from './http-client-connection-initializer.service';

describe('HttpClientConnectionInitializerService', () => {
  let service: HttpClientConnectionInitializerService;

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
        HttpClientConnectionInitializerService,
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

    service = module.get<HttpClientConnectionInitializerService>(
      HttpClientConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
