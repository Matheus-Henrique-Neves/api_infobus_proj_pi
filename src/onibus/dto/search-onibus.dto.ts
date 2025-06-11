import { IsArray, IsOptional, IsString } from 'class-validator';

export class SearchOnibusDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ruas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  semana?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sabado?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domingo?: string[];
}
