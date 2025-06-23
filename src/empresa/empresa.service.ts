import { Injectable } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresaService {
  constructor(@InjectModel(Empresa.name) private empresamodel: Model<Empresa>) { }
  //metodos basicos ja criados pela classe
  findAll() {
    return `This action returns all empresa`;
  }

 findOne(id: number) {
    return `This action returns a #${id} empresa`;
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return `This action updates a #${id} empresa`;
  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }

//esses metodos daki para baixo foram modificados com um objetivo unico
// esse abaixo é para achar um objeto no mongo com base no email
  async findOneByEmail(email: string): Promise<Empresa | null> {
    return this.empresamodel.findOne({ emailDeContato: email }).exec();
  }
// esse abaixo é mudança do Create para ele fazer a criptografia da senha na criação da conta da empresa
  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createEmpresaDto.password, saltRounds);

    const novaEmpresa = new this.empresamodel({
      ...createEmpresaDto,
      password: hashedPassword, // Salva a senha já criptografada
    });

    return novaEmpresa.save();
  }

}
