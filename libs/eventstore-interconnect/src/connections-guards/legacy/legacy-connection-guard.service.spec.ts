import { Test, TestingModule } from '@nestjs/testing';
import { LegacyConnectionGuardService } from './legacy-connection-guard.service';
import { Logger } from '@nestjs/common';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { ConnectionConfiguration, Credentials } from '../../model';
import { setTimeout } from 'timers/promises';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';
import spyOn = jest.spyOn;

describe('LegacyConnectionGuardService', () => {
  let service: LegacyConnectionGuardService;

  const loggerMock = {
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
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
    jest.clearAllTimers();
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should exit process with error 1 when connection is timed out', async () => {
    jest.useFakeTimers();
    jest.spyOn(process, 'exit').mockReturnValue(null as never);

    spyOn(
      eventStoreNodeConnectionMock,
      'getStreamMetadataRaw',
    ).mockImplementation(async (): Promise<any> => {
      await setTimeout(EVENT_WRITER_TIMEOUT_IN_MS * 2);
      return null;
    });

    service
      .startConnectionLinkPinger(eventStoreNodeConnectionMock, configuration)
      .then(() => {
        // do nothing
      });
    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS + 10);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should not process exit 1 when connection is ok', async () => {
    jest.useFakeTimers();
    jest.spyOn(process, 'exit');

    spyOn(
      eventStoreNodeConnectionMock,
      'getStreamMetadataRaw',
    ).mockResolvedValue(null);

    const req = service.startConnectionLinkPinger(
      eventStoreNodeConnectionMock,
      configuration,
    );

    jest.advanceTimersByTime(100);
    await req;
    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS - 100);

    expect(process.exit).not.toHaveBeenCalled();
  });

  it(`should check the '$all' stream metadata for checking connection`, async () => {
    jest.useFakeTimers();
    await service.startConnectionLinkPinger(
      eventStoreNodeConnectionMock,
      configuration,
    );

    expect(
      eventStoreNodeConnectionMock.getStreamMetadataRaw,
    ).toHaveBeenCalledWith('$all', configuration.credentials);
  });

  it(`should check the connection link every ${CONNECTION_LINK_CHECK_INTERVAL_IN_MS} seconds`, async () => {
    jest.useFakeTimers();
    spyOn(service, 'startConnectionLinkPinger');
    spyOn(
      eventStoreNodeConnectionMock,
      'getStreamMetadataRaw',
    ).mockResolvedValue(null);

    const req = service.startConnectionLinkPinger(
      eventStoreNodeConnectionMock,
      configuration,
    );

    jest.advanceTimersByTime(100);
    await req;
    jest.advanceTimersByTime(CONNECTION_LINK_CHECK_INTERVAL_IN_MS);

    expect(service.startConnectionLinkPinger).toHaveBeenCalledTimes(2);
  });
});
