// Arquivo corrigido: src/auth/auth.module.ts

import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';
import { EmpresaModule } from 'src/empresa/empresa.module';

@Global()
@Module({
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  imports: [
    // O AuthModule só precisa dos módulos cujos serviços ele usa diretamente.
    forwardRef(() => UsersModule),
    EmpresaModule,
    // A linha 'OnibusModule' foi removida daqui.
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  // Exportamos os providers para que fiquem disponíveis para toda a aplicação
  exports: [AuthService, AuthGuard,JwtModule],
})
export class AuthModule {}
