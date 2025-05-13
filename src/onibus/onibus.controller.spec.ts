import { Test, TestingModule } from '@nestjs/testing';
import { OnibusController } from './onibus.controller';
import { OnibusService } from './onibus.service';

describe('OnibusController', () => {
  let controller: OnibusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnibusController],
      providers: [OnibusService],
    }).compile();

    controller = module.get<OnibusController>(OnibusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
