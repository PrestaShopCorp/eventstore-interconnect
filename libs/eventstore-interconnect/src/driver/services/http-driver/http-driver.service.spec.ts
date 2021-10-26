import { HttpDriverService } from './http-driver.service';
import { HTTPClient } from 'geteventstore-promise';

describe('HttpDriverService', () => {
  let service: HttpDriverService;

  const client: HTTPClient = {
    writeEvent: jest.fn(),
  } as any as HTTPClient;

  beforeEach(async () => {
    service = new HttpDriverService(client);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
