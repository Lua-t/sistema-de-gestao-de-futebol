# Sistema de Gestão de Futebol Amador

O Sistema de Gestão de Futebol Amador é uma plataforma completa desenvolvida para automatizar a organização de torneios esportivos. Desde a criação da tabela até o controle rigoroso de suspensões e artilharia, o sistema transforma a experiência de organizadores, atletas e torcedores.

---

## Principais Funcionalidades

- **Gestão de Campeonatos:** pontos corridos ou grupos com fase eliminatória.
- **Geração Automática de Tabela:** confrontos criados sem conflito de horários.
- **Estatísticas em Tempo Real:** classificação, artilharia e assistências atualizadas ao registrar resultados.
- **Controle Disciplinar:** suspensões automáticas por cartões.
- **Gestão de Jogadores:** cadastro com nível de habilidade (estrelas).

---

## Stack

| Camada | Tecnologias |
|---|---|
| Back-end | Python 3.12, Django 6, Django REST Framework, Django Channels |
| Autenticação | JWT (djangorestframework-simplejwt), bcrypt |
| Banco de dados | SQLite (desenvolvimento) |
| Front-end | React 19, TypeScript, Vite, Tailwind CSS, Axios |

---

## Como rodar o projeto completo

### Pré-requisitos

- Python 3.12+
- Node.js 18+ e npm

> Sem Node.js instalado, instale via [nvm](https://github.com/nvm-sh/nvm):
> ```bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
> source ~/.bashrc
> nvm install 20
> ```

---

### Passo 1 — Clone o repositório

```bash
git clone <url-do-repositorio>
cd sistema-de-gestao-de-futebol
```

---

### Passo 2 — Configure e inicie o Back-end

```bash
cd Back-end

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# Instale as dependências Python
pip install django djangorestframework djangorestframework-simplejwt django-channels django-cors-headers bcrypt

# Aplique as migrations do banco de dados
python manage.py makemigrations
python manage.py migrate

# (Opcional) Crie um superusuário para acessar o admin
python manage.py createsuperuser

# Inicie o servidor Django
python manage.py runserver
```

O Django ficará disponível em **http://localhost:8000**.

> **Email em desenvolvimento:** por padrão o sistema tenta enviar emails via SMTP.
> Para ver os emails no terminal em vez de enviá-los, altere em `settings.py`:
> ```python
> EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
> ```

---

### Passo 3 — Configure e inicie o Front-end

Abra um **novo terminal** (mantendo o Django rodando no anterior):

```bash
cd Front-end

# Instale as dependências Node
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O front-end ficará disponível em **http://localhost:3000**.

---

### Passo 4 — Acesse o sistema

Abra o navegador em **http://localhost:3000**.

- Crie uma conta em **Cadastrar**
- Faça login com seu email e senha
- O front-end se comunica automaticamente com o Django — todas as chamadas para `/api/*` são redirecionadas para `http://localhost:8000/api/*`

---

## Variáveis de ambiente (opcionais)

Defina antes de rodar o Django para habilitar envio de email real:

```bash
export EMAIL_HOST_USER="seu@gmail.com"
export EMAIL_HOST_PASSWORD="senha-de-app-do-google"
export DEFAULT_FROM_EMAIL="seu@gmail.com"
export FRONTEND_URL="http://localhost:3000"
```

Ou crie um arquivo `.env` na raiz do projeto e carregue com `python-dotenv`.

---

## Estrutura do projeto

```
sistema-de-gestao-de-futebol/
├── Back-end/
│   ├── core/               # App principal (models, views, serializers, urls)
│   ├── projeto/            # Configurações Django (settings, urls, wsgi, asgi)
│   ├── manage.py
│   └── db.sqlite3
└── Front-end/
    ├── src/
    │   ├── pages/          # Telas (Login, Register, Players, Profile...)
    │   ├── context/        # AuthContext — gerencia sessão do usuário
    │   ├── services/       # api.ts — cliente Axios com interceptor JWT
    │   └── components/     # Componentes reutilizáveis (Layout, etc.)
    ├── server.ts           # Servidor Express + proxy para o Django
    ├── vite.config.ts
    └── package.json
```

---

## Como a integração funciona

O front-end roda em Express (porta 3000) e serve o React. Toda requisição para `/api/*` é **encaminhada automaticamente** para o Django na porta 8000 — sem necessidade de configurar CORS no browser.

```
Navegador → localhost:3000/api/login/
               ↓ proxy (server.ts)
         Django → localhost:8000/api/login/
```

A autenticação usa **JWT**. Após o login, dois tokens são armazenados no `localStorage`:

| Token | Validade | Uso |
|---|---|---|
| `access` | 5 minutos | Enviado no header `Authorization: Bearer` |
| `refresh` | 1 dia | Renovar o `access` automaticamente ao expirar |

O Axios intercepta respostas `401` e renova o token de forma transparente. Se o refresh também expirar, o usuário é redirecionado para o login.

---

## Endpoints da API

Todas as rotas (exceto login, registro e recuperação de senha) exigem:
```
Authorization: Bearer <access_token>
```

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/login/` | Login | Não |
| POST | `/api/register/` | Cadastro | Não |
| POST | `/api/token/refresh/` | Renovar token | Não |
| POST | `/api/password/recovery/` | Enviar email de recuperação | Não |
| POST | `/api/password/reset/` | Redefinir senha | Não |
| GET | `/api/perfil/` | Ver perfil | Sim |
| PATCH | `/api/perfil/` | Editar perfil | Sim |
| GET | `/api/jogadores/` | Listar jogadores | Sim |
| POST | `/api/jogadores/` | Cadastrar jogador | Sim |
| PUT | `/api/jogadores/<id>/` | Editar jogador | Sim |
| DELETE | `/api/jogadores/<id>/` | Desativar jogador | Sim |
