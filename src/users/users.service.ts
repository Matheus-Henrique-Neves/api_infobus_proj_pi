import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class UsersService {
   constructor(@InjectModel(User.name) private userModel: Model<User>) {}
   async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    // 1. Gera o hash da senha pura. O bcrypt cria o "sal" aleatório automaticamente.
    const hashedPassword = await bcrypt.hash(createUserDto.senha, saltRounds);

    // 2. Cria o novo usuário com a senha já hasheada.
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }


  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

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
}
