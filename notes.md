# Annotations

Documento de anotacões feitas durante o desenvolvimento do projeto **LinkTrue**.

## Typescript

Config

Dependencias necessarias para o Typescript.

```
npm i typescript @types/node tsx -D
```

Executa um arquivo global de node_modules/bin chamado tsc responsavel por criar o arquivo de configuracao do typescript.

```
npx tsc --init
```

Buscar no repositório [tsconfig/bases](<https://](https://github.com/tsconfig/bases)https://>) da Microsoft para verificar as configuracões referentes a versão do Node.

## Docker Compose

Configuracão do Docker Compose

```
version: "3.8"

services:
  postgres:
    image: bitnami/postgresql:latest
    ports:
      - "5432:5432"
    environment:
      - POSTGRESQL_USERNAME=myuser
      - POSTGRESQL_PASSWORD=mysecretpassword
      - POSTGRESQL_DATABASE=linktrue
    volumes:
      - postgres_data:/bitnami/postgresql/data

  redis:
    image: bitnami/redis:latest
    ports:
      - "6379:6379"
    environment:
      - REDIS_PASSWORD=mypassword
    volumes:
      - redis_data:/bitnami/redisql/data

volumes:
  postgres_data:
  redis_data:

```

Executando o compose

```
docker compose up -d
```

### Criacão dos modelos

```
npm i postgres redis
```

Após criados os arquivos de configuracão, conexão e modelos dos bancos em ./src/lib/arquivos. Para criar as tabelas no banco crie e execute o script(setup) de execucão adicionado ao package.json, execute

```
npm run setup
```

a
