import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { OnibusService } from './onibus.service';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';
import { SearchOnibusDto } from './dto/search-onibus.dto';
import { Onibus } from './entities/onibus.entity';
import { GeocodeOnibusDto } from './dto/geocode-onibus.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdvancedSearchDto } from './dto/advanced-search';


@Controller('onibus')
export class OnibusController {
  constructor(private readonly onibusService: OnibusService) {}
  @Post('geocodificar')
  geocodeAddresses(@Body() geocodeDto: GeocodeOnibusDto) {
    return this.onibusService.geocodeAddresses(geocodeDto.ruas);
  }

  // ✅ Criar um novo ônibus
  @UseGuards(AuthGuard) // 1. Aplica o guardião de autenticação
  @Post('criar') // Mudamos a rota para ser mais explícita
  create(@Request() req, @Body() createOnibusDto: CreateOnibusDto) {
    const contaLogada = req.user; // 2. O AuthGuard nos dá o payload do token aqui

    // 3. Verificamos se quem está logado é uma empresa
    if (contaLogada.type !== 'empresa') {
      throw new UnauthorizedException('Apenas empresas podem criar rotas.');
    }

    const empresaId = contaLogada.sub; // 4. Pegamos o ID da empresa do token
    
    // 5. Chamamos o serviço, passando os dados do ônibus E o ID da empresa
    return this.onibusService.create(createOnibusDto, empresaId);
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
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateOnibusDto: UpdateOnibusDto) {
    const contaLogada = req.user;
    if (contaLogada.type !== 'empresa') {
      throw new UnauthorizedException('Apenas empresas podem modificar rotas.');
    }
    const empresaId = contaLogada.sub;
    return this.onibusService.update(id, updateOnibusDto, empresaId);
  }

 // Em /src/onibus/onibus.controller.ts

// Não se esqueça de importar UseGuards, Request, e UnauthorizedException do @nestjs/common

@UseGuards(AuthGuard) // 1. Protege a rota, garantindo que um token válido foi enviado
@Delete(':id')
remove(@Request() req, @Param('id') id: string): Promise<Onibus> {
  const contaLogada = req.user; // 2. O Guard coloca os dados do token (payload) aqui

  // 3. Garante que o tipo de conta logada é 'empresa'
  if (contaLogada.type !== 'empresa') {
    throw new UnauthorizedException('Apenas empresas podem remover rotas.');
  }

  const empresaId = contaLogada.sub; // 4. Pega o ID da empresa do token

  // 5. Chama o serviço com os DOIS argumentos necessários
  return this.onibusService.remove(id, empresaId);
}

  // 🔍 Buscar ônibus por número da rota
  @Get('rota/:routeNumber')
  findByRouteNumber(@Param('routeNumber') routeNumber: string): Promise<Onibus> {
    return this.onibusService.findByRouteNumber(routeNumber);
  }

  // 🔍 Buscar ônibus por filtros avançados (ruas, dias, etc.)
  @Post(':type/buscar')
  searchOnibus(@Param("type") type:string,@Body() searchDto: SearchOnibusDto): Promise<Onibus[]> {
    // Verifica o tipo de busca e chama o método apropriado
    // O tipo de busca é passado como parte da rota, por exemplo: /onibus/pricisao/buscar
    // ou /onibus/contenha/buscar
    if(type =="precisao"){
    return this.onibusService.searchOnibusANY(searchDto);
    }
    else if(type =="contenha"){
      return this.onibusService.searchOnibusOR(searchDto);
    }
    else {
      throw new Error(`Tipo de busca inválido: ${type}`);
    }
  }

 @Post('pesquisa-avancada')
searchAdvanced(@Body() searchDto: AdvancedSearchDto): Promise<Onibus[]> {
  return this.onibusService.searchAdvanced(searchDto);
}

}
