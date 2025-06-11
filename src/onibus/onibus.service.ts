import { Injectable } from '@nestjs/common';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';
import { Onibus } from './entities/onibus.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SearchOnibusDto } from './dto/search-onibus.dto';

@Injectable()
export class OnibusService {
  constructor(
    @InjectModel(Onibus.name) private readonly onibusModel: Model<Onibus>,
  ) {}

  async create(createOnibusDto: CreateOnibusDto): Promise<Onibus> {
    const createdOnibus = new this.onibusModel(createOnibusDto);
    return createdOnibus.save();
  }

  async findAll(): Promise<Onibus[]> {
    return this.onibusModel.find().exec();
  }

  async findOne(id: string): Promise<Onibus> {
    const onibus = await this.onibusModel.findById(id).exec();
    if (!onibus) {
      throw new Error(`Onibus with id ${id} not found`);
    }
    return onibus;
  }

  async update(id: string, updateOnibusDto: UpdateOnibusDto): Promise<Onibus> {
    const updatedOnibus = await this.onibusModel
      .findByIdAndUpdate(id, updateOnibusDto, {
        new: true,
      })
      .exec();
    if (!updatedOnibus) {
      throw new Error(`Onibus with id ${id} not found`);
    }
    return updatedOnibus;
  }

  async remove(id: string): Promise<Onibus> {
    const deletedOnibus = await this.onibusModel.findByIdAndDelete(id).exec();
    if (!deletedOnibus) {
      throw new Error(`Onibus with id ${id} not found`);
    }
    return deletedOnibus;
  }

  async findByRouteNumber(routeNumber: string): Promise<Onibus[]> {
    const onibus =await this.onibusModel.find({ Num_Onibus: routeNumber }).exec();
    if (!onibus || onibus.length === 0) {
      throw new Error(`Onibus de numero => ${routeNumber} não encontrado`);
    }
    return onibus;
  }
  
searchOnibus(filtro: SearchOnibusDto): Promise<Onibus[]> {
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

}
