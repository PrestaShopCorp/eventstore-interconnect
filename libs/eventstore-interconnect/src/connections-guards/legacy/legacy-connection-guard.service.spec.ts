import { Test, TestingModule } from '@nestjs/testing';
import { LegacyConnectionGuardService } from './legacy-connection-guard.service';
import { Logger } from 'nestjs-pino-stackdriver';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import {
  ConnectionConfiguration,
  Credentials,
} from '../../interconnection-configuration';
import spyOn = jest.spyOn;
import { setTimeout } from 'timers/promises';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';

describe('LegacyConnectionGuardService', () => {
  let service: LegacyConnectionGuardService;

  const loggerMock = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const eventStoreNodeConnectionMock = {
    getStreamMetadataRaw: jest.fn(),
  } as any as EventStoreNodeConnection;

  const credentials: Credentials = { username: '', password: '' };
  const configuration: ConnectionConfiguration = {
    credentials,
    tcp: {
      host: '',
      port: 456,
    },
    http: {
      host: '',
      port: 123,
    },
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyConnectionGuardService,
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<LegacyConnectionGuardService>(
      LegacyConnectionGuardService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should exit process with error 1 when connection is timed out', async () => {
    jest.useFakeTimers('legacy');
    jest.spyOn(process, 'exit').mockReturnValue(null as never);

    spyOn(
      eventStoreNodeConnectionMock,
      'getStreamMetadataRaw',
    ).mockImplementation(async (): Promise<any> => {
      await setTimeout(EVENT_WRITER_TIMEOUT_IN_MS * 2);
      return null;
    });

    service
      .checkTcpConnection(eventStoreNodeConnectionMock, configuration)
      .then(() => {
        // do nothing
      });
    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS + 10);

    expect(process.exit).toHaveBeenCalledWith(1);
    jest.runAllTimers();
  });

  it(`should check the '$all' stream metadata for checking connection`, async () => {
    jest.useFakeTimers('legacy');
    await service.checkTcpConnection(
      eventStoreNodeConnectionMock,
      configuration,
    );

    expect(
      eventStoreNodeConnectionMock.getStreamMetadataRaw,
    ).toHaveBeenCalledWith('$all', configuration.credentials);
    jest.runAllTimers();
  });
});
