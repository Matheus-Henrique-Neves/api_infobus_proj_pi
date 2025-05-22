import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { OnibusModule } from './onibus/onibus.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://DEVUSER:DEVUSER@cluster-matheus.wyyx1.mongodb.net/INFOBUS_DEV?retryWrites=true&w=majority&appName=Cluster-matheus',
    ),
    OnibusModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  onModuleInit() {
    this.connection
      .asPromise()
      .then(() => {
        console.log('\n✅ Conectado ao MongoDB com sucesso! na porta\n');
      })
      .catch((err) => {
        if (err instanceof Error) {
          console.error('\n❌ Erro ao conectar ao MongoDB:\n', err.message);
        } else {
          console.error('Erro desconhecido');
        }
      });
  }
}
