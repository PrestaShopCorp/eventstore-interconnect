import { Test, TestingModule } from '@nestjs/testing';
import { NextConnectionGuardService } from './next-connection-guard.service';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../constants';
import { setTimeout } from 'timers/promises';
import { CONNECTION_LINK_CHECK_INTERVAL_IN_MS } from '../connection-guard.constants';
import { ConnectionConfiguration } from '../../model';
import spyOn = jest.spyOn;
import { LOGGER } from '../../logger';

describe('NextConnectionGuardService', () => {
  let service: NextConnectionGuardService;

  const connection = { listAllPersistentSubscriptions: jest.fn() } as any;

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
          provide: LOGGER,
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
    spyOn(connection, 'listAllPersistentSubscriptions');

    await service.startConnectionLinkPinger(
      connection,
      connectionConfiguration,
    );

    expect(connection.listAllPersistentSubscriptions).toHaveBeenCalled();
  });

  it('should process exit 1 when connection is timed out', async () => {
    jest.useFakeTimers();
    spyOn(process, 'exit').mockReturnValue(null as never);

    spyOn(connection, 'listAllPersistentSubscriptions').mockImplementation(
      async () => {
        return await setTimeout(EVENT_WRITER_TIMEOUT_IN_MS + 100);
      },
    );

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

    spyOn(connection, 'listAllPersistentSubscriptions').mockResolvedValue(null);

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
