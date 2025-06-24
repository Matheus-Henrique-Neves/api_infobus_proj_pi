import { Module } from '@nestjs/common';
import { OnibusService } from './onibus.service';
import { OnibusController } from './onibus.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Onibus, OnibusSchema } from './entities/onibus.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    
    MongooseModule.forFeature([{ name: Onibus.name, schema: OnibusSchema }]),
    AuthModule,
    HttpModule,
  ],
  controllers: [OnibusController],
  providers: [OnibusService],
  exports: [OnibusService], 
})
export class OnibusModule {}