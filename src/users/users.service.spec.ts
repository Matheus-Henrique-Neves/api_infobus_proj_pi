// src/users/users.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { OnibusService } from '../onibus/onibus.service';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// Mock para o OnibusService
const mockOnibusService = {
  findAllByRouteNumbers: jest.fn(),
};

// Mock para o UserModel, usando a mesma técnica que aprendemos
const mockSave = jest.fn();

const mockUserModel: any = jest.fn().mockImplementation(() => ({
  save: mockSave,
}));
// Adicionando os métodos estáticos ao mock
mockUserModel.find = jest.fn();
mockUserModel.findOne = jest.fn();
mockUserModel.findById = jest.fn();
mockUserModel.findByIdAndUpdate = jest.fn();
mockUserModel.updateOne = jest.fn();

describe('UsersService', () => {
  let service: UsersService;
  let onibusService: OnibusService;
  // `model` não é usado diretamente, mas é bom ter a referência se precisar
  let model: typeof mockUserModel; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: OnibusService,
          useValue: mockOnibusService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    onibusService = module.get<OnibusService>(OnibusService);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário com a senha hasheada', async () => {
      // ARRANGE
      const createUserDto = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: 'senha123',
        idade: 25,
        rotas_salvas: [],
      };
      const hashedPassword = 'senhaHasheada';
      const userSalvo = { ...createUserDto, senha: hashedPassword };
      
      // Mockamos a função de hash do bcrypt
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockSave.mockResolvedValue(userSalvo);

      // ACT
      const result = await service.create(createUserDto);

      // ASSERT
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.senha, 10);
      expect(mockUserModel).toHaveBeenCalledWith({
        ...createUserDto,
        senha: hashedPassword,
      });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(userSalvo);
    });
  });


  describe('findOneById', () => {
    it('deve encontrar um usuário pelo ID e retornar sem a senha', async () => {
      // ARRANGE
      const userId = 'user-id-123';
      const mockUser = { nome: 'Usuário Mock', email: 'mock@email.com' };

      // CORREÇÃO AQUI:
      // Agora, o método .select() é que retorna a promessa resolvida.
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // ACT
      const result = await service.findOneById(userId);

      // ASSERT
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      // ARRANGE
      // CORREÇÃO AQUI:
      // O método .select() agora retorna uma promessa que se resolve com `null`.
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // ACT & ASSERT
      // Agora o `await` no serviço vai receber `null`, o `if` será ativado e a exceção será lançada.
      await expect(service.findOneById('id-fake')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMySavedRoutes', () => {
    it('deve buscar as rotas salvas de um usuário e retornar os detalhes dos ônibus', async () => {
      const userId = 'user-id-123';
      const savedRoutesNumbers = ['301', '309'];
      const mockUser = { Rotas_Salvas: savedRoutesNumbers };
      const mockBusDetails = [{ Num_Onibus: '301', Rota: ['Centro'] }];

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      mockOnibusService.findAllByRouteNumbers.mockResolvedValue(mockBusDetails);

      const result = await service.findMySavedRoutes(userId);
      
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(onibusService.findAllByRouteNumbers).toHaveBeenCalledWith(savedRoutesNumbers);
      expect(result).toEqual(mockBusDetails);
    });
  });
  
  describe('changePassword', () => {
    it('deve alterar a senha se a senha atual for válida', async () => {
      const userId = 'user-id-123';
      const changePasswordDto = { senhaAtual: 'senhaAntiga', novaSenha: 'senhaNova' };
      const mockUser = { senha: 'hashDaSenhaAntiga' };
      const hashDaSenhaNova = 'hashDaSenhaNova';

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never); // Senha bate
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashDaSenhaNova as never);
      mockUserModel.updateOne.mockResolvedValue({} as any);

      await service.changePassword(userId, changePasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith('senhaAntiga', 'hashDaSenhaAntiga');
      expect(bcrypt.hash).toHaveBeenCalledWith('senhaNova', 10);
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { senha: hashDaSenhaNova },
      );
    });

    it('deve lançar UnauthorizedException se a senha atual for inválida', async () => {
       const userId = 'user-id-123';
       const changePasswordDto = { senhaAtual: 'senhaErrada', novaSenha: 'senhaNova' };
       const mockUser = { senha: 'hashDaSenhaAntiga' };

       mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never); // Senha não bate

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});