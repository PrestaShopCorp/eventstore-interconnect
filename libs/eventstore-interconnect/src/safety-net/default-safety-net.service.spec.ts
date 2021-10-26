import { Test, TestingModule } from '@nestjs/testing';
import { DefaultSafetyNetService } from './default-safety-net.service';

describe('DefaultSafetyNetService', () => {
  let service: DefaultSafetyNetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultSafetyNetService],
    }).compile();

    service = module.get<DefaultSafetyNetService>(DefaultSafetyNetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
