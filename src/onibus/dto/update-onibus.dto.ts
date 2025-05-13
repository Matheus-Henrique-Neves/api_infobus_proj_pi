import { PartialType } from '@nestjs/mapped-types';
import { CreateOnibusDto } from './create-onibus.dto';

export class UpdateOnibusDto extends PartialType(CreateOnibusDto) {}
