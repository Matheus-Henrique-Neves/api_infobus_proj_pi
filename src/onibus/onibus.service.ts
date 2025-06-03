import { Injectable } from '@nestjs/common';
import { CreateOnibusDto } from './dto/create-onibus.dto';
import { UpdateOnibusDto } from './dto/update-onibus.dto';
import { Onibus } from './entities/onibus.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

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
    return this.onibusModel.find({ Num_Onibus: routeNumber }).exec();
  }
  
async searchOnibus(
  ruas: string[],
  semana: string[],
  sabado: string[],
  domingo: string[]
): Promise<Onibus[]> {
  const filter: any = {};
  if (ruas && ruas.length > 0) filter.Rota = { $all: ruas };
  if (semana && semana.length > 0) filter.Semana = { $all: semana };
  if (sabado && sabado.length > 0) filter.Sabado = { $all: sabado };
  if (domingo && domingo.length > 0) filter.Domingo = { $all: domingo };
  //isso pesquisa com o flitro no mongo bd atlas isso é uma delicia
  return this.onibusModel.find(filter).exec();
}

}
