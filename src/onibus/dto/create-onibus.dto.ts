import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOnibusDto {
  @IsString()
  @IsNotEmpty()
  Cidade_Operante: string;

  @IsString()
  @IsNotEmpty()
  Empresa_Controladora: string;

  @IsString()
  @IsNotEmpty()
  Num_Onibus: string;

  @IsArray()
  @IsString({ each: true })
  Rota: string[];

  @IsNumber()
  Valor_Passagem: number;

  @IsOptional()
  @IsString()
  Observacoes?: string;

  @IsArray()
  @IsString({ each: true })
  Semana: string[];

  @IsArray()
  @IsString({ each: true })
  Sabado: string[];

  @IsArray()
  @IsString({ each: true })
  Domingo: string[];
}