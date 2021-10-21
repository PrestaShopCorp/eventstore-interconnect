import { Test, TestingModule } from '@nestjs/testing';
import { EventstoreInterconnectService } from './eventstore-interconnect.service';

describe('EventstoreInterconnectService', () => {
  let service: EventstoreInterconnectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventstoreInterconnectService],
    }).compile();

    service = module.get<EventstoreInterconnectService>(
      EventstoreInterconnectService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
