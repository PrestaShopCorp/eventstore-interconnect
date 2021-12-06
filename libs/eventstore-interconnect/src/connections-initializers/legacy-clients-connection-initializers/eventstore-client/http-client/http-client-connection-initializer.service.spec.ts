import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from '@nestjs/common';
import { ConnectionConfiguration } from "../../../../interconnection-configuration";
import { CONNECTION_CONFIGURATION } from "../../../../constants";
import { HttpClientConnectionInitializerService } from "./http-client-connection-initializer.service";

describe('HttpClientConnectionInitializerService', () => {
  let service: HttpClientConnectionInitializerService;

  const loggerMock = {
    log: jest.fn(),
  };

  const connectionConfiguration: ConnectionConfiguration = {
    credentials: {
      username: '',
      password: '',
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
          provide: CONNECTION_CONFIGURATION,
          useValue: connectionConfiguration,
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
