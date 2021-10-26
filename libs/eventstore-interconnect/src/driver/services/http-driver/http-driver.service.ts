import { Injectable } from '@nestjs/common';
import { Driver } from '../driver.interface';
import { HTTPClient } from 'geteventstore-promise';

@Injectable()
export class HttpDriverService implements Driver {
  constructor(private readonly client: HTTPClient) {}

  public writeEvent(event: any): Promise<any> {
    const { data, metadata, eventStreamId, eventType } = event;
    console.log('eventStreamId : ', eventStreamId);
    return this.client.writeEvent(eventStreamId, eventType, data, metadata);
  }
}
