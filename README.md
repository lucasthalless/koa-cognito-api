# Koa Cognito API

API RESTful construída com KoaJS, TypeScript, TypeORM e integração com AWS Cognito para autenticação.

## 🛠 Tecnologias Utilizadas

- Node.js
- TypeScript
- KoaJS
- TypeORM
- PostgreSQL
- AWS Cognito
- Docker & Docker Compose

## 🚀 Como Executar

### Pré-requisitos

- Docker
- Docker Compose
- AWS Cognito User Pool configurado

### Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/koa-cognito-api.git
cd koa-cognito-api
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações:
```env
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=cognito_api
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=seu-user-pool-id
COGNITO_CLIENT_ID=seu-client-id
```
(Para fim de teste, deixei credenciais de um Cognito meu no `.env`!)

3. Inicie os containers:
```bash
docker-compose up -d
```

## 📌 Rotas da API

### Autenticação

#### POST /auth
Rota pública para login/registro de usuários.

**Request Body:**
```json
{
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário"
}
```

**Response (200):**
```json
{
    "user": {
        "id": "uuid",
        "email": "usuario@exemplo.com",
        "name": "Nome do Usuário",
        "role": "user",
        "isOnboarded": false,
        "createdAt": "2025-01-21T..."
    }
}
```

### Perfil do Usuário

#### GET /me
Rota protegida para obter informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token-jwt>
```

**Response (200):**
```json
{
    "user": {
        "id": "uuid",
        "email": "usuario@exemplo.com",
        "name": "Nome do Usuário",
        "role": "user",
        "isOnboarded": true
    }
}
```

### Edição de Conta

#### PUT /edit-account
Rota protegida para atualizar informações do usuário.

**Headers:**
```
Authorization: Bearer <token-jwt>
```

**Request Body (Usuário comum):**
```json
{
    "name": "Novo Nome"
}
```

**Request Body (Admin):**
```json
{
    "name": "Novo Nome",
    "role": "admin"
}
```

### Listagem de Usuários

#### GET /users
Rota protegida, acessível apenas para administradores.

**Headers:**
```
Authorization: Bearer <token-jwt>
```

**Response (200):**
```json
{
    "users": [
        {
            "id": "uuid",
            "email": "usuario@exemplo.com",
            "name": "Nome do Usuário",
            "role": "user",
            "isOnboarded": true
        }
        // ...
    ]
}
```

## 🔒 Permissões

- **Usuário comum**: Pode editar apenas seu próprio nome
- **Admin**: Pode editar nome e role de qualquer usuário e acessar a listagem de usuários

## 🧪 Testes

Execute os testes com:
```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:coverage
```

## 📦 Comandos Docker Úteis

```bash
# Iniciar os containers
docker-compose up -d

# Visualizar logs
docker-compose logs -f

# Parar os containers
docker-compose down

# Reconstruir os containers
docker-compose up -d --build

# Limpar volumes
docker-compose down -v
```

## 🔍 Monitoramento e Logs

Os logs da aplicação podem ser visualizados com:
```bash
# Todos os serviços
docker-compose logs -f

# Apenas API
docker-compose logs -f api

# Apenas banco de dados
docker-compose logs -f postgres
```

## 📝 Notas Importantes

- As rotas protegidas requerem um token JWT válido do Cognito
- O banco de dados é persistido em um volume Docker
- Em ambiente de desenvolvimento, as migrações são executadas automaticamente

