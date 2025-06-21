import { Module } from '@nestjs/common';
import { OnibusService } from './onibus.service';
import { OnibusController } from './onibus.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Onibus, OnibusSchema } from './entities/onibus.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Onibus.name, schema: OnibusSchema }]),
  ],
  controllers: [OnibusController],
  providers: [OnibusService],
})
export class OnibusModule {}
