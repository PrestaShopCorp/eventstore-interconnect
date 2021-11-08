import {
  AcknowledgeableEventStoreEvent,
  IEventStoreEventOptions,
} from 'nestjs-geteventstore-legacy';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class Nestor {
  @IsBoolean()
  isNestor: boolean;
}

export class ValidableDatasDto {
  constructor(data: ValidableDatasDto) {
    return Object.assign(this, data);
  }

  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  extendedParam?: string;

  @IsBoolean()
  isOk: boolean;

  @ValidateNested()
  @Type(() => Nestor)
  nestor: Nestor;
}

export class Dumb1Event extends AcknowledgeableEventStoreEvent {
  @ValidateNested()
  @Type(() => ValidableDatasDto)
  public data: ValidableDatasDto;

  constructor(data: ValidableDatasDto, options?: IEventStoreEventOptions) {
    super(data, options);
    this.data = new ValidableDatasDto(data);
  }
}
