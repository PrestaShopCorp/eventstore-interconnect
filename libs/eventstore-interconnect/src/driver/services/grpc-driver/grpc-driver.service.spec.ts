import { GrpcDriverService } from './grpc-driver.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { ANY } from 'nestjs-geteventstore-next';

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
});
