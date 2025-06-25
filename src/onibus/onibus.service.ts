import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';
import { Onibus } from './entities/onibus.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SearchOnibusDto } from './dto/search-onibus.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AdvancedSearchDto } from './dto/advanced-search';

@Injectable()
export class OnibusService {
  constructor(
    @InjectModel(Onibus.name) private readonly onibusModel: Model<Onibus>,
    private readonly httpService: HttpService, // Se necessário para geocodificação ou outras operações HTTP
  ) { }


  async geocodeAddresses(ruas: string[]): Promise<([number, number] | null)[]> {
    const results: ([number, number] | null)[] = []; // Array para guardar os resultados

    // Usamos um laço for...of para processar uma rua de cada vez
    for (const rua of ruas) {
      try {
        const enderecoCompleto = `${rua}, Indaiatuba, SP`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          enderecoCompleto,
        )}&limit=1`;

        console.log(`Buscando coordenadas para: "${rua}"`); // Log para acompanhar o progresso

        const response = await firstValueFrom(
          this.httpService.get(url, {
            headers: { 'User-Agent': 'InfoBusApp/1.0 (seuemail@exemplo.com)' }, // É uma boa prática incluir um contato
          }),
        );

        if (response.data && response.data[0]) {
          const { lat, lon } = response.data[0];
          results.push([parseFloat(lat), parseFloat(lon)]);
        } else {
          results.push(null);
        }
      } catch (error) {
        // Se a requisição falhar (como o erro 429), logamos e continuamos
        console.error(`Erro ao geocodificar "${rua}":`, error.response?.data || error.message);
        results.push(null);
      }

      // --- A PARTE MAIS IMPORTANTE ---
      // Espera 1.1 segundos antes de ir para a próxima rua para respeitar o limite da API
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    return results;
  }




  async findAll(): Promise<Onibus[]> {
    return this.onibusModel.find().exec();
  }

  async findOne(id: string): Promise<Onibus> {
    const onibus = await this.onibusModel.findById(id).exec();
    if (!onibus) {
      throw new NotFoundException(`Onibus with id ${id} not found`);
    }
    return onibus;
  }

async create(createOnibusDto: CreateOnibusDto, empresaId: string): Promise<Onibus> {
    const ruas = createOnibusDto.Rota;

    // --- PASSO A: Geocodificar as paradas (como antes) ---
    console.log('PASSO A: Iniciando geocodificação das paradas...');
    const coordenadasDasParadas = await this.geocodeAddresses(ruas);
    const paradasValidas = coordenadasDasParadas.filter(Boolean) as [number, number][];
    console.log('PASSO A: Geocodificação das paradas finalizada.');

    // --- PASSO B: Buscar o caminho roteado entre as paradas (NOVO!) ---
    let caminhoRoteado: [number, number][] = [];
    if (paradasValidas.length > 1) {
      console.log('PASSO B: Buscando caminho roteado no OSRM...');
      const coordsString = paradasValidas.map(c => `${c[1]},${c[0]}`).join(';');
      const url = `http://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      
      try {
        const response = await firstValueFrom(this.httpService.get(url));
        if (response.data.routes && response.data.routes[0]) {
          // OSRM retorna [lon, lat], então invertemos para [lat, lon]
          caminhoRoteado = response.data.routes[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]
          );
          console.log('PASSO B: Caminho roteado encontrado!');
        }
      } catch (error) {
        console.error('Erro ao buscar caminho no OSRM:', error.message);
        // Se o OSRM falhar, o caminho ficará vazio, mas a rota ainda será criada.
      }
    }

    // --- PASSO C: Montar o objeto final e salvar ---
    const onibusParaSalvar = {
      ...createOnibusDto,
      empresaId: empresaId,
      Rota_Geocodificada: paradasValidas, // Salva as coordenadas dos pinos
      Caminho_Geocodificado: caminhoRoteado, // Salva o caminho da linha
    };

    const createdOnibus = new this.onibusModel(onibusParaSalvar);
    return createdOnibus.save();
  }


  // --- MÉTODO UPDATE MODIFICADO ---
  async update(id: string, updateOnibusDto: UpdateOnibusDto, empresaId: string): Promise<Onibus> {
    // 1. Busca o documento existente para verificar a propriedade
    const onibus = await this.onibusModel.findById(id).exec();

    // 2. Garante que o ônibus existe
    if (!onibus) {
      throw new NotFoundException(`Ônibus com ID "${id}" não encontrado.`);
    }

    // 3. Lógica de segurança: Verifica se a empresa logada é a dona da rota
    if (onibus.empresaId && onibus.empresaId.toString() !== empresaId) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar esta rota.',
      );
    }

    // 4. Prepara o objeto para a atualização
    const dadosParaAtualizar: any = {
      ...updateOnibusDto,
      empresaId: empresaId, // Garante que a propriedade seja mantida/adotada
    };

    // 5. CONDIÇÃO PRINCIPAL: Só executa se uma nova Rota (lista de ruas) for enviada
    if (updateOnibusDto.Rota && updateOnibusDto.Rota.length > 0) {
      // 5a. Geocodifica as novas paradas
      console.log('Rota alterada, iniciando geocodificação das paradas...');
      const coordenadasDasParadas = await this.geocodeAddresses(updateOnibusDto.Rota);
      const paradasValidas = coordenadasDasParadas.filter(Boolean) as [number, number][];
      dadosParaAtualizar.Rota_Geocodificada = paradasValidas;
      console.log('Geocodificação das paradas finalizada.');

      // 5b. Busca o novo caminho roteado no OSRM
      let caminhoRoteado: [number, number][] = [];
      if (paradasValidas.length > 1) {
        console.log('Buscando novo caminho roteado no OSRM...');
        const coordsString = paradasValidas.map(c => `${c[1]},${c[0]}`).join(';');
        const url = `http://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
        
        try {
          const response = await firstValueFrom(this.httpService.get(url));
          if (response.data.routes && response.data.routes[0]) {
            caminhoRoteado = response.data.routes[0].geometry.coordinates.map(
              ([lon, lat]: [number, number]) => [lat, lon]
            );
            console.log('Novo caminho roteado encontrado!');
          }
        } catch (error) {
          console.error('Erro ao buscar novo caminho no OSRM:', error.message);
        }
      }
      
      // 5c. Adiciona o novo caminho ao objeto de atualização
      dadosParaAtualizar.Caminho_Geocodificado = caminhoRoteado;
    }

    // 6. Executa a atualização no banco de dados
    const updatedOnibus = await this.onibusModel.findByIdAndUpdate(id, dadosParaAtualizar, {
      new: true, // Retorna o documento já atualizado
    }).exec();

    if (!updatedOnibus) {
      throw new NotFoundException(`Falha ao atualizar o ônibus com ID "${id}".`);
    }

    return updatedOnibus;
  }

  async remove(id: string, empresaId: string): Promise<Onibus> {
    const onibus = await this.onibusModel.findById(id);

    if (!onibus) {
      throw new NotFoundException(`Ônibus com ID "${id}" não encontrado.`);
    }

    if (onibus.empresaId.toString() !== empresaId) {
      throw new ForbiddenException('Você não tem permissão para remover esta rota.');
    }

    // O findByIdAndDelete também pode retornar null se não encontrar
    const deletedOnibus = await this.onibusModel.findByIdAndDelete(id);

    if (!deletedOnibus) {
      throw new NotFoundException(`Falha ao remover o ônibus com ID "${id}".`);
    }

    return deletedOnibus;
  }

async findByRouteNumber(routeNumber: string): Promise<Onibus> {
  // Usa findOne para buscar apenas um documento
  const onibus = await this.onibusModel.findOne({ Num_Onibus: routeNumber }).exec();

  if (!onibus) {
    // Lança um erro 404 Not Found, que é o padrão do NestJS
    throw new NotFoundException(`Ônibus com número de rota "${routeNumber}" não encontrado.`);
  }

  return onibus;
}

  searchOnibusANY(filtro: SearchOnibusDto): Promise<Onibus[]> {
    const { ruas = [], semana = [], sabado = [], domingo = [] } = filtro;

    // Aqui você pode fazer sua consulta com base nos filtros fornecidos.
    return this.onibusModel.find({
      // Exemplo básico:
      Rota: { $in: ruas },
      Semana: { $in: semana },
      Sabado: { $in: sabado },
      Domingo: { $in: domingo },
    }).exec();
  }
  async findAllByRouteNumbers(routeNumbers: string[]): Promise<Onibus[]> {
  if (!routeNumbers || routeNumbers.length === 0) {
    return [];
  }
  return this.onibusModel.find({
    Num_Onibus: { $in: routeNumbers },
  }).exec();
}

  searchOnibusOR(filtro: SearchOnibusDto): Promise<Onibus[]> {
    const { ruas = [], semana = [], sabado = [], domingo = [] } = filtro;

    // Aqui você pode fazer sua consulta com base nos filtros fornecidos.
    return this.onibusModel.find({
      $or: [
        { Rota: { $in: ruas } },
        { Semana: { $in: semana } },
        { Sabado: { $in: sabado } },
        { Domingo: { $in: domingo } },
      ],
    }).exec();
  }

  

  async searchAdvanced(filtro: AdvancedSearchDto): Promise<Onibus[]> {
  const query: any = {};

  // 1. Filtro por Cidade
  if (filtro.cidade) {
    // Busca exata (case-insensitive)
    query.Cidade_Operante = new RegExp(`^${filtro.cidade}$`, 'i');
  }

  // 2. Filtro por Empresa
  if (filtro.empresa) {
    query.Empresa_Controladora = new RegExp(filtro.empresa, 'i'); // Busca parcial (contém)
  }

  // 3. Filtro por Ruas (passa em X E Y)
  // Usamos o operador $all do MongoDB para garantir que a rota contenha TODAS as ruas especificadas.
  if (filtro.ruas && filtro.ruas.length > 0) {
    // Mapeamos para criar uma regex para cada rua, tornando a busca case-insensitive
    const ruasRegex = filtro.ruas.map(rua => new RegExp(rua, 'i'));
    query.Rota = { $all: ruasRegex };
  }

  // 4. Filtro por Horário (a partir de)
  if (filtro.dia && filtro.horario) {
    // O campo do horário é dinâmico (Semana, Sabado ou Domingo)
    const campoHorario = filtro.dia; 
    
    // $gte (greater than or equal) busca por horários maiores ou iguais ao especificado
    // Isso funciona para strings no formato "HH:MM"
    query[campoHorario] = { $elemMatch: { $gte: filtro.horario } };
  }

  console.log('Executando busca avançada com a query:', JSON.stringify(query, null, 2));

  return this.onibusModel.find(query).exec();
}

}
