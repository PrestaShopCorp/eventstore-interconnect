import { GrpcDriverService } from './grpc-driver.service';
import { Client } from '@eventstore/db-client/dist/Client';

describe('GrpcDriverService', () => {
  let service: GrpcDriverService;

  const client: Client = { appendToStream: jest.fn() } as any as Client;

  beforeEach(async () => {
    service = new GrpcDriverService(client);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
