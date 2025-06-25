// src/empresa/empresa.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';
import { getModelToken } from '@nestjs/mongoose';
import { Empresa } from './entities/empresa.entity';
import * as bcrypt from 'bcrypt';

// Mock para o EmpresaModel, seguindo o padrão que já usamos
const mockSave = jest.fn();
const mockEmpresaModel:any = jest.fn().mockImplementation(() => ({
  save: mockSave,
}));
// Adicionando métodos estáticos
mockEmpresaModel.findOne = jest.fn();


describe('EmpresaService', () => {
  let service: EmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: getModelToken(Empresa.name),
          useValue: mockEmpresaModel,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova empresa com a senha criptografada', async () => {
      // ARRANGE (Preparar)
      const createEmpresaDto = {
        razaoSocial: 'Empresa Teste SA',
        cnpj: '12.345.678/0001-99',
        emailDeContato: 'contato@empresa.com',
        password: 'senhaForte123',
      };
      const hashedPassword = 'senhaSuperSecretaHasheada';
      const empresaSalva = { ...createEmpresaDto, password: hashedPassword };

      // Mockamos as dependências externas
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockSave.mockResolvedValue(empresaSalva);
      
      // ACT (Agir)
      const result = await service.create(createEmpresaDto);

      // ASSERT (Verificar)
      expect(bcrypt.hash).toHaveBeenCalledWith(createEmpresaDto.password, 10);
      expect(mockEmpresaModel).toHaveBeenCalledWith({
        ...createEmpresaDto,
        password: hashedPassword,
      });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(empresaSalva);
    });
  });

  describe('findOneByEmail', () => {
    it('deve encontrar e retornar uma empresa pelo email', async () => {
      const email = 'contato@empresa.com';
      const empresaMock = { razaoSocial: 'Empresa Encontrada', emailDeContato: email };

      mockEmpresaModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(empresaMock),
      });

      const result = await service.findOneByEmail(email);

      expect(mockEmpresaModel.findOne).toHaveBeenCalledWith({ emailDeContato: email });
      expect(result).toEqual(empresaMock);
    });

    it('deve retornar null se nenhuma empresa for encontrada', async () => {
      const email = 'naoexiste@empresa.com';
      mockEmpresaModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOneByEmail(email);

      expect(result).toBeNull();
    });
  });

  // Testes para os métodos básicos que retornam strings
  describe('outros metodos', () => {
    it('findAll deve retornar a string correta', () => {
      expect(service.findAll()).toBe('This action returns all empresa');
    });

    it('findOne deve retornar a string correta', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 empresa');
    });
  });
});