// src/users/users.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UnauthorizedException } from '@nestjs/common';

// Mock completo do UsersService
const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  saveFavoriteRoute: jest.fn(),
  removeFavoriteRoute: jest.fn(),
  findOneById: jest.fn(),
  findMySavedRoutes: jest.fn(),
  changePassword: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
    .overrideGuard(AuthGuard) // Mockamos o AuthGuard para todos os testes neste controller
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (registrar)', () => {
    it('deve chamar o service.create com os dados do usuário', async () => {
      const createUserDto = { nome: 'Teste', email: 'teste@email.com', senha: '123' };
      mockUsersService.create.mockResolvedValue(createUserDto);

      await controller.create(createUserDto as any);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
  
  describe('findMe (GET /me)', () => {
    it('deve chamar o service.findOneById com o ID do usuário do token', async () => {
      const mockReq = { user: { sub: 'user-id-123' } };
      
      await controller.findMe(mockReq);

      expect(service.findOneById).toHaveBeenCalledWith('user-id-123');
    });
  });
  
  describe('saveRoute (rotas/salvar)', () => {
    it('deve chamar o service.saveFavoriteRoute se o tipo de usuário for "user"', async () => {
      const mockReq = { user: { sub: 'user-id-123', type: 'user' } };
      const saveRouteDto = { routeNumber: '301' };

      await controller.saveRoute(mockReq, saveRouteDto);

      expect(service.saveFavoriteRoute).toHaveBeenCalledWith('user-id-123', '301');
    });

    it('deve lançar UnauthorizedException se o tipo de usuário não for "user"', async () => {
      const mockReq = { user: { sub: 'empresa-id-456', type: 'empresa' } };
      const saveRouteDto = { routeNumber: '301' };

      await expect(controller.saveRoute(mockReq, saveRouteDto)).rejects.toThrow(UnauthorizedException);
    });
  });
  
  describe('changeMyPassword (me/alterar-senha)', () => {
    it('deve chamar o service.changePassword com o ID do usuário e o DTO', async () => {
      const mockReq = { user: { sub: 'user-id-123' } };
      const changePasswordDto = { senhaAtual: '123', novaSenha: '456' };
      mockUsersService.changePassword.mockResolvedValue(undefined); // O método não retorna nada

      const result = await controller.changeMyPassword(mockReq, changePasswordDto);

      expect(service.changePassword).toHaveBeenCalledWith('user-id-123', changePasswordDto);
      expect(result).toEqual({ message: 'Senha alterada com sucesso!' });
    });
  });
});