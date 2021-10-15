import {Container} from 'inversify';
import {
  EVENT_STORE_INTERCONNECTOR,
  EventStoreInterconnector,
  IEventStoreInterconnector
} from '@eventstore-interconnect';

export const mainContainer = new Container();
mainContainer.bind<IEventStoreInterconnector>(EVENT_STORE_INTERCONNECTOR).to(EventStoreInterconnector);

