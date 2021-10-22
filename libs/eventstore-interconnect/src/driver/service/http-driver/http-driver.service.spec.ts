import { Test, TestingModule } from '@nestjs/testing';
import { HttpDriverService } from './http-driver.service';

describe('HttpDriverService', () => {
  let service: HttpDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpDriverService],
    }).compile();

    service = module.get<HttpDriverService>(HttpDriverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
