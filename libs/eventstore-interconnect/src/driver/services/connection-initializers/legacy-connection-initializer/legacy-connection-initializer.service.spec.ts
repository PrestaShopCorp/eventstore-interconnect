import { Test, TestingModule } from '@nestjs/testing';
import { LegacyConnectionInitializerService } from './legacy-connection-initializer.service';

describe('LegacyConnectionInitializerService', () => {
  let service: LegacyConnectionInitializerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegacyConnectionInitializerService],
    }).compile();

    service = module.get<LegacyConnectionInitializerService>(
      LegacyConnectionInitializerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
