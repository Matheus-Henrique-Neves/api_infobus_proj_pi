import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class UsersService {
   constructor(@InjectModel(User.name) private userModel: Model<User>) {}
   
  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    // 1. Gera o hash da senha pura. O bcrypt cria o "sal" aleatório automaticamente.
    const hashedPassword = await bcrypt.hash(createUserDto.senha, saltRounds);

    // 2. Cria o novo usuário com a senha já hasheada.
    const newUser = new this.userModel({
      ...createUserDto,
      senha: hashedPassword,
    });

    return newUser.save();
  }


  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }


 async saveFavoriteRoute(userId: string, routeNumber: string): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    // Usamos o operador $addToSet do MongoDB.
    // Ele só adiciona o item à array se ele ainda não existir, evitando duplicatas.
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { Rotas_Salvas: routeNumber } },
      { new: true }, // Retorna o documento atualizado
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`Falha ao salvar rota para o usuário com ID "${userId}".`);
    }

    return updatedUser;
  }
  
    async removeFavoriteRoute(userId: string, routeNumber: string): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    // Usamos o operador $pull do MongoDB.
    // Ele remove todas as ocorrências do item especificado da array.
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { Rotas_Salvas: routeNumber } },
      { new: true }, // Retorna o documento atualizado
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`Falha ao remover rota para o usuário com ID "${userId}".`);
    }

    return updatedUser;
  }


}
