import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmpresaService } from 'src/empresa/empresa.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private empresaService: EmpresaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user &&  await bcrypt.compareSync(password, user.senha)) {
      return user;
    }

    return null;
  }
    async validateEmpresa(email: string, password: string): Promise<any> {
    const empresa = await this.empresaService.findOneByEmail(email); // (você precisará criar este método no empresa.service)
    // 4. Lógica de comparação igual à do usuário
    if (empresa && await bcrypt.compare(password, empresa.password)) {
      const { password, ...result } = empresa.toObject();
      return result;
    }
    return null;
  }
  async login(account: any, type: 'user' | 'empresa') {
    const payload = {
      email: account.email || account.emailDeContato,
      sub: account._id, // 'sub' (subject) é o id do usuário/empresa
      type: type, // <-- ESSENCIAL! Agora sabemos o tipo da conta.
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
