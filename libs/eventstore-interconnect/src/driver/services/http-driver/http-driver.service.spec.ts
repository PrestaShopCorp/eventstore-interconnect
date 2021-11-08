import { HttpDriverService } from './http-driver.service';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import Mock = jest.Mock;
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';

describe('HttpDriverService', () => {
  let service: HttpDriverService;

  const esNodeConnection: EventStoreNodeConnection = {
    appendToStream: jest.fn(),
  } as any as EventStoreNodeConnection;

  const eventId = 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab';

  beforeEach(async () => {
    service = new HttpDriverService(esNodeConnection);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should transmit write event command to the legacy client when writing event', async () => {
    await service.writeEvent({
      eventStreamId: 'a',
      eventId: eventId,
      data: { toto: 123 },
      metadata: {},
    });

    expect(esNodeConnection.appendToStream).toHaveBeenCalled();
  });

  it('should transmit the eventId for idempotency when writing event', async () => {
    await service.writeEvent({
      eventStreamId: 'a',
      eventId,
      data: { toto: 123 },
      metadata: {},
      eventType: 'eventType',
    });

    const callerArgs = (esNodeConnection.appendToStream as Mock).mock.calls[0];
    expect(callerArgs[0]).toEqual('a');
    expect(callerArgs[1]).toEqual(ExpectedVersion.Any);
    expect(callerArgs[2].eventId).toEqual(eventId);
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
