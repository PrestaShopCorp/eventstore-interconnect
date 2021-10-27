import { Injectable } from '@nestjs/common';
import { Driver } from '../driver.interface';
import { HTTPClient } from 'geteventstore-promise';

@Injectable()
export class HttpDriverService implements Driver {
  constructor(private readonly client: HTTPClient) {}

  public async writeEvent(event: any): Promise<any> {
    await this.client.writeEvent(
      event.eventStreamId,
      event.eventType,
      event.data,
      event.metadata,
    );
  }
}
