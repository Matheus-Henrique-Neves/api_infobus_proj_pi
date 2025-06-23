import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Para manter os papéis organizados e evitar erros de digitação,
// usamos um Enum. No futuro, podemos adicionar 'empresa' ou 'admin'.
export enum UserRole {
  USER = 'usuario_comum',
}

@Schema({ timestamps: true }) // timestamps adiciona os campos createdAt e updatedAt automaticamente
export class User extends Document {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: false }) // O campo Idade não é obrigatório
  idade: number;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  senha: string; // Este campo armazenará a senha JÁ HASHEADA pelo bcrypt

  @Prop({ type: [String], default: [] }) // Um array de strings, começando vazio
  Rotas_Salvas: string[];

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole; // Campo para definir o papel do usuário no sistema
}

export const UserSchema = SchemaFactory.createForClass(User);