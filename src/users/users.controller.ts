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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SaveRouteDto } from './dto/save_route.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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






}
