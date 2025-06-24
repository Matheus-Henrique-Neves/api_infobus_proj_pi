import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SaveRouteDto } from './dto/save_route.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post("registrar")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post('rotas/salvar')
  async saveRoute(@Request() req, @Body() saveRouteDto: SaveRouteDto) {
    const contaLogada = req.user;

    // Garante que quem está logado é um usuário comum, não uma empresa
    if (contaLogada.type !== 'user') {
      throw new UnauthorizedException('Apenas usuários podem salvar rotas favoritas.');
    }

    const userId = contaLogada.sub; // ID do usuário, vindo do token JWT
    const { routeNumber } = saveRouteDto; // Número da rota, vindo do corpo da requisição

    return this.usersService.saveFavoriteRoute(userId, routeNumber);
  }

  @UseGuards(AuthGuard)
  @Post('rotas/remover') // Usamos POST por consistência, mas DELETE também seria semanticamente correto
  async removeRoute(@Request() req, @Body() saveRouteDto: SaveRouteDto) {
    const contaLogada = req.user;

    if (contaLogada.type !== 'user') {
      throw new UnauthorizedException('Apenas usuários podem remover rotas favoritas.');
    }

    const userId = contaLogada.sub;
    const { routeNumber } = saveRouteDto;

    return this.usersService.removeFavoriteRoute(userId, routeNumber);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  findMe(@Request() req) {
    // O 'sub' é o ID do usuário que colocamos no token JWT
    return this.usersService.findOneById(req.user.sub); // Você precisará criar o método findOneById no service
  }

  // Endpoint para buscar os detalhes das rotas salvas do usuário logado
  @UseGuards(AuthGuard)
  @Get('me/rotas')
  findMyRoutes(@Request() req) {
    return this.usersService.findMySavedRoutes(req.user.sub);
  }

   @UseGuards(AuthGuard)
  @Patch('me/alterar-senha') // 2. Crie o novo endpoint
  @HttpCode(HttpStatus.OK) // Define o status de sucesso como 200 OK
  async changeMyPassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.sub; // Pega o ID do usuário logado a partir do token
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Senha alterada com sucesso!' }; // Retorna uma mensagem de sucesso
  }






}
