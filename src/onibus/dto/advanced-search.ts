import { IsString, IsOptional, IsArray, ArrayMinSize, Matches } from 'class-validator';

export class AdvancedSearchDto {
  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1) // Garante que se o array for enviado, ele não esteja vazio
  ruas?: string[]; // Para buscar por "lugar X e Y"

  @IsOptional()
  @IsString()
  dia?: 'Semana' | 'Sabado' | 'Domingo'; // Para selecionar o campo de horário

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'O horário deve estar no formato HH:MM' })
  horario?: string; // Horário no formato "HH:MM"
}