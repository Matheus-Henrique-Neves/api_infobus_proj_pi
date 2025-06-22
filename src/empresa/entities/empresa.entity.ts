// Em /src/empresa/entities/empresa.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Empresa extends Document {
  @Prop({ required: true })
  razaoSocial: string;

  @Prop({ required: true, unique: true })
  cnpj: string;

  @Prop({ required: true, unique: true })
  emailDeContato: string;

  @Prop({ required: true })
  password: string;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);