import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';
import { Onibus } from './entities/onibus.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SearchOnibusDto } from './dto/search-onibus.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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

  // --- MÉTODO CREATE MODIFICADO ---
  async create(createOnibusDto: CreateOnibusDto, empresaId: string): Promise<Onibus> {
    // 1. Pega a lista de nomes de ruas do DTO
    const ruas = createOnibusDto.Rota;

    // 2. Chama nosso serviço de geocodificação que já está pronto
    console.log('Iniciando geocodificação para nova rota...');
    const coordenadas = await this.geocodeAddresses(ruas);
    console.log('Geocodificação finalizada.');

    // 3. Monta o objeto completo para salvar no banco
    const onibusParaSalvar = {
      ...createOnibusDto,
      empresaId: empresaId, // Associa a rota à empresa que a criou
      Rota_Geocodificada: coordenadas.filter(Boolean), // Salva as coordenadas, removendo as nulas
    };

    const createdOnibus = new this.onibusModel(onibusParaSalvar);
    return createdOnibus.save();
  }

  // --- MÉTODO UPDATE MODIFICADO ---
  async update(id: string, updateOnibusDto: UpdateOnibusDto, empresaId: string): Promise<Onibus> {
    const onibus = await this.onibusModel.findById(id); // Primeiro, apenas busca o ônibus

    if (!onibus) {
      throw new NotFoundException(`Ônibus com ID "${id}" não encontrado.`);
    }

    if (onibus.empresaId.toString() !== empresaId) {
      throw new ForbiddenException('Você não tem permissão para modificar esta rota.');
    }

    if (updateOnibusDto.Rota) {
      console.log('Rota alterada, iniciando nova geocodificação...');
      const coordenadas = await this.geocodeAddresses(updateOnibusDto.Rota);
      updateOnibusDto['Rota_Geocodificada'] = coordenadas.filter(Boolean);
      console.log('Geocodificação finalizada.');
    }
    const updatedOnibus = await this.onibusModel.findByIdAndUpdate(id, updateOnibusDto, { new: true });

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

  async findByRouteNumber(routeNumber: string): Promise<Onibus[]> {
    const onibus = await this.onibusModel.find({ Num_Onibus: routeNumber }).exec();
    if (!onibus || onibus.length === 0) {
      throw new Error(`Onibus de numero => ${routeNumber} não encontrado`);
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

}
