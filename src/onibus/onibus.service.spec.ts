// src/onibus/onibus.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { OnibusService } from './onibus.service';
import { getModelToken } from '@nestjs/mongoose';
import { Onibus } from './entities/onibus.entity';
import { HttpService } from '@nestjs/axios';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

// Mock do Model do Mongoose.
// Basicamente, criamos um objeto falso que tem as funções que usamos no serviço (find, findById, etc.)
// O jest.fn() nos deixa espionar quando e como essas funções são chamadas.
const mockSave = jest.fn();

const mockOnibusModel: any = jest.fn().mockImplementation(() => ({
  save: mockSave,
}));

mockOnibusModel.find = jest.fn();
mockOnibusModel.findById = jest.fn();
mockOnibusModel.findOne = jest.fn();
mockOnibusModel.findByIdAndUpdate = jest.fn();
mockOnibusModel.findByIdAndDelete = jest.fn();

// Mock do HttpService, usado para a geocodificação
const mockHttpService = {
  get: jest.fn(),
};

describe('OnibusService', () => {
  let service: OnibusService;

  beforeEach(async () => {
    // Aqui criamos um "módulo de teste" do NestJS.
    // Ele carrega o nosso serviço e os "mocks" (objetos falsos) que definimos acima.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnibusService,
        {
          provide: getModelToken(Onibus.name),
          useValue: mockOnibusModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<OnibusService>(OnibusService);
  });

  // Limpa os mocks depois de cada teste para não interferirem um no outro.
  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should be defined', () => {
    // Teste simples para garantir que o serviço foi criado corretamente.
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar uma lista de ônibus', async () => {
      // ARRANGE (Preparar): Dizemos ao mock o que ele deve retornar.
      const onibusDeExemplo = [{ Num_Onibus: '301' }];
      mockOnibusModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(onibusDeExemplo),
      });

      // ACT (Agir): Chamamos a função que queremos testar.
      const resultado = await service.findAll();

      // ASSERT (Verificar): Verificamos se o resultado é o que esperávamos.
      expect(resultado).toEqual(onibusDeExemplo);
      expect(mockOnibusModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um ônibus pelo ID', async () => {
      const id = 'some-id';
      const onibusDeExemplo = { _id: id, Num_Onibus: '302' };
      mockOnibusModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(onibusDeExemplo),
      });

      const resultado = await service.findOne(id);

      expect(resultado).toEqual(onibusDeExemplo);
      expect(mockOnibusModel.findById).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException se o ônibus não for encontrado', async () => {
      const id = 'id-que-nao-existe';
      mockOnibusModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null), // Simula o "não encontrado"
      });

      // Verificamos se a função lança o erro esperado.
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

describe('create', () => {
    it('deve criar e retornar um novo ônibus com dados geocodificados', async () => {
      // ARRANGE
      const createDto = { Num_Onibus: '707', Rota: ['Rua 1', 'Rua 2'] };
      const empresaId = 'empresa-123';
      const onibusSalvo = { ...createDto, empresaId, _id: 'novo-id' };
      
      // Prepara o que o método `.save()` deve retornar
      mockSave.mockResolvedValue(onibusSalvo);
      
      const geocodeSpy = jest.spyOn(service, 'geocodeAddresses').mockResolvedValueOnce([[1, 2], [3, 4]]);
      mockHttpService.get.mockReturnValueOnce(of({ data: { routes: [{ geometry: { coordinates: [[2,1],[4,3]] } }] }}));

      // ACT
      const resultado = await service.create(createDto as any, empresaId);
      
      // ASSERT
      expect(resultado).toEqual(onibusSalvo);
      // Verifica se o construtor foi chamado com os dados corretos
      expect(mockOnibusModel).toHaveBeenCalledWith(expect.any(Object));
      // Verifica se o método save foi chamado na instância criada
      expect(mockSave).toHaveBeenCalled();
      expect(geocodeSpy).toHaveBeenCalledWith(createDto.Rota);
    });
  });

  describe('remove', () => {
    it('deve remover um ônibus se o ID da empresa for correto', async () => {
      const id = 'id-para-remover';
      const empresaId = 'dono-do-onibus';
      const onibusDeExemplo = { _id: id, empresaId, Num_Onibus: '505' };

      // Simula a busca e a remoção
      mockOnibusModel.findById.mockResolvedValue(onibusDeExemplo);
      mockOnibusModel.findByIdAndDelete.mockResolvedValue(onibusDeExemplo);

      const resultado = await service.remove(id, empresaId);

      expect(resultado).toEqual(onibusDeExemplo);
      expect(mockOnibusModel.findById).toHaveBeenCalledWith(id);
      expect(mockOnibusModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('deve lançar ForbiddenException se a empresa não for a dona', async () => {
      const id = 'id-para-remover';
      const empresaDonaId = 'dono-do-onibus';
      const empresaTentaRemoverId = 'outra-empresa';
      const onibusDeExemplo = { _id: id, empresaId: empresaDonaId };

      mockOnibusModel.findById.mockResolvedValue(onibusDeExemplo);
      
      // Verifica se a função lança o erro de "proibido"
      await expect(service.remove(id, empresaTentaRemoverId)).rejects.toThrow(ForbiddenException);
    });
  });
});