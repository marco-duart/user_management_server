# User Management Server

## Requisitos Iniciais

Antes de começar, certifique-se de ter instalado em sua máquina:
- Node.js
- npm ou yarn
- PostgreSQL
- Git

## Configuração do Projeto

1. Clone o repositório:
```
   git clone https://github.com/marco-duart/user_management_server.git
   cd user_management_server
```

2. Instale as dependências:
```
   npm install
```
   ou
```
   yarn install
```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` fornecido.
   - Crie um arquivo `.env.test.local` na raiz do projeto baseado no `.env.test.local.example` fornecido.
   - Preencha todos os valores necessários, especialmente:
     - Credenciais do banco de dados
     - Segredo JWT
     - Credenciais do Google OAuth

5. Banco de dados:
   - Certifique-se que o PostgreSQL está rodando
   - A API criará automaticamente o banco de dados se ele não existir

## Executando a Aplicação

Executar o comando:
```
npm start
```

A API estará disponível em `http://localhost:3001` (ou na porta configurada no .env)

## Documentação da API

Acesse a documentação Swagger em:
http://localhost:3001/api/v1/docs

## Testes

Testes unitários:
```
npm run test
```

Testes de integração:
```
npm run test:e2e
```

## Variáveis de Ambiente

| Variável               | Descrição                                 | Default
|------------------------|-------------------------------------------|-----------------------|
| PORT                   | Porta da aplicação                        | 3001                                              |
| JWT_SECRET             | Segredo para tokens JWT                   |                                                   |
| JWT_EXPIRATION         | Tempo de expiração do token JWT           | 2h                                                |
| DB_HOST                | Host do banco de dados                    | localhost                                         |
| DB_PORT                | Porta do banco de dados                   | 5432                                              |
| DB_USERNAME            | Usuário do banco de dados                 | postgres                                          |
| DB_PASSWORD            | Senha do banco de dados                   |                                                   |
| DB_NAME                | Nome do banco de dados                    | user_management                                   |
| GOOGLE_CLIENT_ID       | Client ID para OAuth Google               |                                                   |
| GOOGLE_CLIENT_SECRET   | Client Secret para OAuth Google           |                                                   |
| GOOGLE_CALLBACK_URL    | URL de callback do Google OAuth           | http://localhost:3001/api/v1/auth/google/callback |
| FRONTEND_URL           | URL do frontend para redirecionamentos    | ttp://localhost:5173/google-callback              |
| FRONTEND_ERROR_URL     | URL do frontend para erros                | http://localhost:5173                             |

## Variáveis de Ambiente de teste

| Variável               | Descrição                                 | Default
|------------------------|-------------------------------------------|-----------------------|
| PORT                   | Porta da aplicação                        | 3000                                              |
| JWT_SECRET             | Segredo para tokens JWT                   |                                                   |
| JWT_EXPIRATION         | Tempo de expiração do token JWT           | 2h                                                |
| DB_HOST                | Host do banco de dados                    | localhost                                         |
| DB_PORT                | Porta do banco de dados                   | 5432                                              |
| DB_USERNAME            | Usuário do banco de dados                 | postgres                                          |
| DB_PASSWORD            | Senha do banco de dados                   |                                                   |
| DB_NAME                | Nome do banco de dados                    | user_management_test                              |

## Rotas e Funcionalidades Principais

### Autenticação
- **POST /auth/register** - Cria um novo usuário com os dados básicos (nome, email, senha)
- **POST /auth/login** - Autentica usuário com email/senha e retorna token JWT
- **GET /auth/me** - Retorna informações do usuário autenticado (requer token JWT)
- **GET /auth/google** - Inicia fluxo de autenticação pelo Google
- **GET /auth/google/callback** - Callback do Google OAuth (uso interno)

### Gerenciamento de Usuários
- **GET /users** - Lista todos os usuários (apenas admin) com:
  - Filtro por role (tipo de usuário)
  - Ordenação por nome ou data de criação
  - Paginação automática
- **GET /users/inactive** - Lista usuários inativos (último login > 30 dias)
- **PATCH /users/:id** - Atualiza dados do usuário:
  - Usuários comuns podem atualizar apenas seus próprios dados
  - Admins podem atualizar qualquer usuário
- **DELETE /users/:id** - Remove usuário (apenas admin)

## Fluxo de Autenticação JWT
1. Usuário faz login ou registro
2. Sistema gera token JWT com:
   - Payload contendo user ID e role
   - Tempo de expiração configurável (padrão 2h)
3. Token é enviado ao cliente e deve ser incluído no header Authorization

## Decisões de Arquitetura e Design

### Estrutura de Pastas
A organização do projeto segue uma estrutura modular por domínio/feature:

src/  
├── auth/ # Tudo relacionado a autenticação  
├── database/ # Configurações e entidades do banco  
├── decorators/ # Decoradores customizados  
├── enums/ # Enumeradores compartilhados  
├── users/ # Tudo relacionado a usuários  
├── testing/ # Mocks para testes unitários  
└── test/ # Testes de integração  

### Autenticação e Autorização
- Implementamos JWT para autenticação
- Google OAuth2 para login social
- Sistema de roles (user, admin) com guards
- Proteção de rotas sensíveis apenas para admins

### Banco de Dados
- PostgreSQL como banco relacional principal
- TypeORM para ORM com suporte a migrations
- Auto-criação do banco de dados na inicialização (se não existir)
- Entidades com colunas padrão (createdAt, updatedAt, deletedAt)

### Documentação
- Swagger integrado para documentação automática da API
- DTOs documentados
- PR template

### Segurança
- Validação de dados em todos os endpoints
- Hash de senhas com bcrypt antes de armazenar
- Pipes de validação globais


### Testes
- Testes unitários
- Testes de integração

## **Deploy**
`Endpoint Base`  
http://34.31.28.30:3001/api/v1  
`Swagger Docs`  
http://34.31.28.30:3001/api/v1/docs  

### Problema no OAuth
- **Erro 400** do Google: bloqueia IPs brutos (`34.31.28.30`)  
- Exige **domínio válido** (ex: `.com`, `.br`)  
- Para o deploy, não é possível realizar a dinâmica de OAuth2.0 

## Licença
Este projeto está licenciado sob a Apache License Version 2.0 - veja o arquivo LICENSE para detalhes.
