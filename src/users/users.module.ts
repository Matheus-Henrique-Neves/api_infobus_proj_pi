// Em /src/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose'; // 1. Importe o MongooseModule
import { User, UserSchema } from './entities/user.entity'; // 2. Importe seu User e UserSchema

@Module({
  imports: [
    // 3. Adicione esta linha para registrar o schema
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 4. Exporte o serviço para o AuthModule poder usá-lo
})
export class UsersModule {}