import { Injectable } from '@nestjs/common';
import { Driver } from '../driver.interface';

@Injectable()
export class HttpDriverService implements Driver {
  public writeEvent(
    eventStreamId: string,
    eventType: string,
    data: any,
    metadata: any,
  ) {
    console.log('wrote with httpDriver');
  }
}
