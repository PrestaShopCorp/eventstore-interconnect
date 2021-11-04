import { HttpReaderService } from './http-reader.service';
import { EventStoreNodeConnection } from 'node-eventstore-client';
import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import Mock = jest.Mock;

describe('HttpReaderService', () => {
  let service: HttpReaderService;

  const esNodeConnection: EventStoreNodeConnection = {
    appendToStream: jest.fn(),
  } as any as EventStoreNodeConnection;

  const eventId = 'a4817909-c6d6-4a0b-bc54-467a2dfad4ab';

  beforeEach(async () => {
    service = new HttpReaderService(esNodeConnection);
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
});
