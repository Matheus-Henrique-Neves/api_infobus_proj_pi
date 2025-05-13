import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OnibusService } from './onibus.service';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';

@Controller('onibus')
export class OnibusController {
  constructor(private readonly onibusService: OnibusService) {}

  @Post()
  create(@Body() createOnibusDto: CreateOnibusDto) {
    return this.onibusService.create(createOnibusDto);
  }

  @Get()
  findAll() {
    return this.onibusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onibusService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOnibusDto: UpdateOnibusDto) {
    return this.onibusService.update(id, updateOnibusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onibusService.remove(id);
  }

  @Get('rota/:routeNumber')
  findByRouteNumber(@Param('routeNumber') routeNumber: string) {
    return this.onibusService.findByRouteNumber(routeNumber);
  }

  // Rota para buscar por ruas e horários
  @Post('buscar')
  findByStreetsAndTimes(
    @Body('streets') streets: string[],
    @Body('times') times: string[],
  ) {
    return this.onibusService.findByStreetsAndTimes(streets, times);
  }


}
