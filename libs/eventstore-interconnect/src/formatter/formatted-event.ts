export interface FormattedEvent {
  eventId: string;
  contentType: 'application/json';
  type: string;
  data: any;
  metadata: any;
  streamId: string;
}
