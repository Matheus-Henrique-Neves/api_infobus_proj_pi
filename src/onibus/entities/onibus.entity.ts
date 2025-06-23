import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Schema({ collection: 'Onibus', timestamps: true })
export class Onibus extends Document {
  @Prop()
  Cidade_Operante: string;

  @Prop()
  Empresa_Controladora: string;

  @Prop()
  Num_Onibus: string;

  @Prop()
  Rota: string[];

  @Prop()
  Valor_Passagem: number;

  @Prop({ required: false })
  Observacoes: string;

  @Prop()
  Semana: string[];

  @Prop()
  Sabado : string[];

  @Prop()
  Domingo : string[];

  @Prop({ type: [[Number]] }) // Formato: [[lat1, lon1], [lat2, lon2], ...]
  Rota_Geocodificada: number[][]; // <-- CAMPO NOVO PARA AS COORDENADAS

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true })
  empresaId: Empresa; // <-- CAMPO NOVO PARA O ID DA EMPRESA
}
export const OnibusSchema = SchemaFactory.createForClass(Onibus);
