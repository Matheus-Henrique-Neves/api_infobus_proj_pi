import { Controller, Body, Post, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    // Constructor logic here
    // e.g., initializing properties or injecting dependencies
  }
  @Post('user/login') // <-- Rota para login de passageiros
  async loginUser(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Informe o email e senha');
    }
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new NotFoundException('Email ou senha inválidos');
    }
    return this.authService.login(user, 'user'); // Passa o tipo 'user'
  }

  @Post('empresa/login') // <-- Rota para login de empresas
  async loginEmpresa(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Informe o email e senha');
    }
    const empresa = await this.authService.validateEmpresa(body.email, body.password);
    if (!empresa) {
      throw new NotFoundException('Email ou senha inválidos');
    }
    return this.authService.login(empresa, 'empresa'); // Passa o tipo 'empresa'
  }
}
