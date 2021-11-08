import { GrpcDriverService } from './grpc-driver.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';

describe('GrpcDriverService', () => {
  let service: GrpcDriverService;

  const client: Client = { appendToStream: jest.fn() } as any as Client;

  beforeEach(async () => {
    service = new GrpcDriverService(client);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should transmit write order to client with good options when writing event', async () => {
    await service.writeEvent({});

    expect(client.appendToStream).toHaveBeenCalled();
  });

  it('should give the event Id for idempotency when writing event', async () => {
    const event = {
      data: {},
      metadata: {},
      eventStreamId: 'test',
      eventType: 'toto',
      eventId: 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab',
    };

    await service.writeEvent(event);

    expect(client.appendToStream).toHaveBeenCalledWith(
      'test',
      [
        {
          contentType: 'application/json',
          data: {},
          id: 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab',
          metadata: {},
          type: 'toto',
        },
      ],
      { expectedRevision: ANY },
    );
  });

  it('should use the driver to write event when handling the event', async () => {
    spyOn(driver, 'writeEvent').mockResolvedValue(true);

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    await handler.handle(event);

    expect(driver.writeEvent).toHaveBeenCalled();
  });

  it('should trigger the safety net hook in case of failure when writing event', async () => {
    spyOn(driver, 'writeEvent').mockImplementation(() => {
      throw Error();
    });
    spyOn(safetyNet, 'hook');

    await handler.handle(event);

    expect(safetyNet.hook).toHaveBeenCalled();
  });

  it('should trigger safety net hook when write event timed out', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    spyOn(driver, 'writeEvent').mockImplementation(async () => {
      setTimeout(() => null, EVENT_WRITER_TIMEOUT_IN_MS * 2);
    });
    spyOn(safetyNet, 'hook');

    await handler.handle(event);

    jest.advanceTimersByTime(EVENT_WRITER_TIMEOUT_IN_MS);

    expect(safetyNet.hook).toHaveBeenCalled();
  });

  it('should check the validity of the events args when handling one', () => {
    spyOn(handler, 'validateEventAndDatasDto');

    handler.handle(event);

    expect(handler.validateEventAndDatasDto).toHaveBeenCalled();
  });
});
