import { DefaultSafetyNetService } from './default-safety-net.service';
import { Logger } from 'nestjs-pino-stackdriver';
import spyOn = jest.spyOn;

describe('DefaultSafetyNetService', () => {
  let hook: DefaultSafetyNetService;

  const logger: Logger = { log: jest.fn(), error: jest.fn() } as any as Logger;

  beforeEach(async () => {
    hook = new DefaultSafetyNetService(logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should do nothing when event were written and hook is called', () => {
    spyOn(process, 'exit');
    hook.hook({}, true);

    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should exit the process when while calling the hook, the event is not written', () => {
    jest.spyOn(process, 'exit');
    hook.hook({ nack: jest.fn() }, false);

    expect(process.exit).toHaveBeenCalled();
  });

  it('should nack the event when process fails to write the event', () => {
    jest.spyOn(process, 'exit');

    const event = { nack: jest.fn() };
    hook.hook(event, false);

    expect(event.nack).toHaveBeenCalled();
  });
});
