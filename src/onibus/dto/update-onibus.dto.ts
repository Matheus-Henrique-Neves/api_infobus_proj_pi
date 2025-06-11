import { PartialType } from '@nestjs/mapped-types';
import { CreateOnibusDto } from './create-onibus.dto';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class UpdateOnibusDto extends PartialType(CreateOnibusDto) {


  @IsOptional()
  @IsString()
  Cidade_Operante?: string;

  @IsOptional()
  @IsString()
  Empresa_Controladora?: string;

  @IsOptional()
  @IsString()
  Num_Onibus?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Rota?: string[];

  @IsOptional()
  @IsNumber()
  Valor_Passagem?: number;

  @IsOptional()
  @IsString()
  Observacoes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Semana?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Sabado?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Domingo?: string[];
}