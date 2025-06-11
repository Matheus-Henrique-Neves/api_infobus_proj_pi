import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OnibusService } from './onibus.service';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';
import { SearchOnibusDto } from './dto/search-onibus.dto';
import { Onibus } from './entities/onibus.entity';

@Controller('onibus')
export class OnibusController {
  constructor(private readonly onibusService: OnibusService) {}

  // ✅ Criar um novo ônibus
  @Post()
  create(@Body() createOnibusDto: CreateOnibusDto): Promise<Onibus> {
    return this.onibusService.create(createOnibusDto);
  }

  // ✅ Buscar todos os ônibus
  @Get()
  findAll(): Promise<Onibus[]> {
    return this.onibusService.findAll();
  }

  // ✅ Buscar ônibus por ID
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Onibus> {
    return this.onibusService.findOne(id);
  }

  // ✅ Atualizar um ônibus parcialmente
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOnibusDto: UpdateOnibusDto,
  ): Promise<Onibus> {
    return this.onibusService.update(id, updateOnibusDto);
  }

  // ✅ Remover um ônibus
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Onibus> {
    return this.onibusService.remove(id);
  }

  // 🔍 Buscar ônibus por número da rota
  @Get('rota/:routeNumber')
  findByRouteNumber(@Param('routeNumber') routeNumber: string): Promise<Onibus[]> {
    return this.onibusService.findByRouteNumber(routeNumber);
  }

  // 🔍 Buscar ônibus por filtros avançados (ruas, dias, etc.)
  @Post('buscar')
  searchOnibus(@Body() searchDto: SearchOnibusDto): Promise<Onibus[]> {
    return this.onibusService.searchOnibus(searchDto);
  }
}
