import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';
import { EmpresaModule } from 'src/empresa/empresa.module';
@Module({
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  imports: [
    UsersModule,
    EmpresaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [AuthGuard,AuthService],
})
export class AuthModule {}
