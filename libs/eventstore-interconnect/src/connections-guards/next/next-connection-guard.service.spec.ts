import { Test, TestingModule } from '@nestjs/testing';
import { NextConnectionGuardService } from './next-connection-guard.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { setTimeout } from 'timers/promises';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';
import { ConnectionConfiguration } from '../../model';
import { Logger } from '@nestjs/common';
import spyOn = jest.spyOn;

describe('NextConnectionGuardService', () => {
  let service: NextConnectionGuardService;

  const connection = { getStreamMetadata: jest.fn() } as any as Client;

  const connectionConfiguration: ConnectionConfiguration = {
    credentials: undefined,
    connectionString: 'toto',
  };

  const loggerMock = {
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NextConnectionGuardService,
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<NextConnectionGuardService>(
      NextConnectionGuardService,
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

  it('should check the connection link when pinger starts', async () => {
    spyOn(connection, 'getStreamMetadata');

    await service.startConnectionLinkPinger(
      connection,
      connectionConfiguration,
    );

    expect(connection.getStreamMetadata).toHaveBeenCalledWith('$all');
  });

  it('should process exit 1 when connection is timed out', async () => {
    jest.useFakeTimers();
    spyOn(process, 'exit').mockReturnValue(null as never);

    spyOn(connection, 'getStreamMetadata').mockImplementation(async () => {
      return await setTimeout(EVENT_WRITER_TIMEOUT_IN_MS + 100);
    });

    service
      .startConnectionLinkPinger(connection, connectionConfiguration)
      .then(() => {
        // Do nothing
      });

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should not process exit 1 when connection is ok', async () => {
    jest.useFakeTimers();
    spyOn(process, 'exit').mockReturnValue(null as never);

    spyOn(connection, 'getStreamMetadata').mockResolvedValue(null);

    const req = service.startConnectionLinkPinger(
      connection,
      connectionConfiguration,
    );

    jest.advanceTimersByTime(100);

    await req;

    expect(process.exit).not.toHaveBeenCalled();
  });

  it(`should check connection link every ${CONNECTION_LINK_CHECK_INTERVAL_IN_MS} seconds`, async () => {
    jest.useFakeTimers();
    spyOn(service, 'startConnectionLinkPinger');

    const promise = service.startConnectionLinkPinger(
      connection,
      connectionConfiguration,
    );

    jest.advanceTimersByTime(CONNECTION_LINK_CHECK_INTERVAL_IN_MS);

    expect(service.startConnectionLinkPinger).toHaveBeenCalledTimes(2);
    await promise;
  });

  it(`should check connection link every ${CONNECTION_LINK_CHECK_INTERVAL_IN_MS} seconds`, async () => {
    jest.useFakeTimers();
    spyOn(service, 'startConnectionLinkPinger');

    const promise = service.startConnectionLinkPinger(
      connection,
      connectionConfiguration,
    );

    jest.advanceTimersByTime(CONNECTION_LINK_CHECK_INTERVAL_IN_MS);

    expect(service.startConnectionLinkPinger).toHaveBeenCalledTimes(2);
    await promise;
  });
});
