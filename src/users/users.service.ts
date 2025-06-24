import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnibusService } from 'src/onibus/onibus.service';
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class UsersService {
   constructor(@InjectModel(User.name) private userModel: Model<User>,
   private readonly onibusService: OnibusService
  ) {}
   
  findAll() {
    return `This action returns all users`;
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



  async findMySavedRoutes(userId: string) {
  const user = await this.userModel.findById(userId).select('Rotas_Salvas');
  if (!user) {
    throw new NotFoundException('Usuário não encontrado.');
  }
  // Agora, buscamos os detalhes completos dos ônibus baseados nos números salvos
  return this.onibusService.findAllByRouteNumbers(user.Rotas_Salvas);
}

async findOneById(id: string) {
    const user = await this.userModel.findById(id).select('-senha'); // .select('-senha') exclui a senha da resposta
    if (!user) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return user;
}

async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { senhaAtual, novaSenha } = changePasswordDto;

    // Busca o usuário no banco, mas DESTA VEZ, selecionando a senha
    const user = await this.userModel.findById(userId).select('+senha').exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Compara a senha enviada pelo usuário com a senha hasheada no banco
    const isPasswordMatching = await bcrypt.compare(senhaAtual, user.senha);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('A senha atual está incorreta.');
    }

    // Se a senha atual estiver correta, crie o hash da nova senha
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(novaSenha, saltRounds);

    // Atualiza o usuário no banco de dados com a nova senha hasheada
    await this.userModel.updateOne(
      { _id: userId },
      { senha: hashedNewPassword },
    );
  }
  


}
