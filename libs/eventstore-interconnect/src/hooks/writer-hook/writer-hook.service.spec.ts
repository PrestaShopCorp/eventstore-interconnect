import { Test, TestingModule } from "@nestjs/testing";
import { DefaultWriterHookService } from "./default-writer-hook.service";

describe('WriterHookService', () => {
  let service: DefaultWriterHookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultWriterHookService],
    }).compile();

    service = module.get<DefaultWriterHookService>(DefaultWriterHookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
