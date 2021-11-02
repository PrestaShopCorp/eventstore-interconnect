import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
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

export class Example1Event extends EventStoreAcknowledgeableEvent {
  @ValidateNested()
  @Type(() => ValidableDatasDto)
  public readonly data: ValidableDatasDto;

  constructor(data: ValidableDatasDto, options?: EventOptionsType) {
    super(data, options);
    this.data = data;
  }
}
