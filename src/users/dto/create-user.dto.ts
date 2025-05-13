export class CreateUserDto {
    nome: string; // Nome do usuário
    idade: number; // Idade como número
    email: string; // E-mail do usuário
    rotas_salvas: string[]; // Array de strings para rotas salvas
    senha: string; // Senha do usuário
}
/*o que eu vou ter no banco de dados como exemplo é isso 

{"_id":{"$oid":"6819f2c65992c3135df5066a"},"nome":"NOME ILUSTRATIVO",
"Idade":{"$numberInt":"99"},
"email":"NOMEILUSTRATIVO@gmail.cpm",
"Rotas_Salvas":["301","309","245"],
"senha":"$2a$12$vCJ6mbgY7wP8sM3ezKww2uXHYdEBJPgl3jwWhGxzYNTlXqaHK3rEe"}

*/



