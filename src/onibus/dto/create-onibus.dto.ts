export class CreateOnibusDto {
  Cidade_Operante: string;
  Empresa_Controladora: string;
  Num_Onibus: string;
  Rota: string[];
  Valor_Passagem: number;
  Observacoes?: string; // Campo opcional
  Horario: string[];
   
}
