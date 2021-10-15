import {IEventStoreInterconnector} from './eventstore-interconnector.interface';
import {InterconnectionConfiguration} from './model/interconnection-configuration.interfaces';
import {injectable} from 'inversify';

@injectable()
export class EventStoreInterconnector implements IEventStoreInterconnector {
  public connectToV21x(conf: InterconnectionConfiguration): void {

  }
}
