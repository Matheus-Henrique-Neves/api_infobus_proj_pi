import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



@Schema({collection:"Onibus"})
export class Onibus extends Document {

    @Prop()
    Cidade_Operante: string;

    @Prop()
    Empresa_Controladora: string;

    @Prop()
    Num_Onibus: string;

    @Prop()
    Rota:string[];

    @Prop()
    Valor_Passagem: number;

    @Prop({required:false})
    Observacoes:string;

    @Prop()
    Horario:string[];

}
export const OnibusSchema = SchemaFactory.createForClass(Onibus)
