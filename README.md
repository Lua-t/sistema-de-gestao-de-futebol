# Sistema de Gestão de Futebol Amador

O Sistema de Gestão de Futebol Amador é uma plataforma completa desenvolvida para automatizar a organização de torneios esportivos. Desde a criação da tabela até o controle rigoroso de suspensões e artilharia, o sistema transforma a experiência de organizadores, atletas e torcedores.

---

## Principais Funcionalidades

### Gestão de Campeonatos

- **Múltiplos Formatos:** Suporte para pontos corridos ou grupos com fase eliminatória (mata-mata).
- **Geração Automática de Tabela:** Algoritmo inteligente que cria todos os confrontos, garantindo que não haja conflitos de horários para os times.
- **Customização Total:** Edição de critérios de desempate, logos de times, cores e gestão de elencos (jogadores).

### Estatísticas e Classificação em Tempo Real

- **Atualização Automática:** Ao registrar o resultado de uma partida, a tabela de classificação é atualizada instantaneamente.
- **Artilharia e Assistências:** Ranking automatizado dos principais destaques do campeonato.
- **Boletim de Jogo:** Resumo detalhado com gols e eventos de cada partida.

### Controle Disciplinar Inteligente

- **Gestão de Cartões:** Sistema automático de suspensão (ex: 2 amarelos ou 1 vermelho retiram o jogador da próxima partida).
- **Histórico do Atleta:** Registro completo da trajetória de cada jogador no torneio.

---

## Stack

- **Back-end:** Python 3.12, Django 6, Django REST Framework, Django Channels
- **Autenticação:** JWT via djangorestframework-simplejwt, bcrypt
- **Banco de dados:** SQLite (desenvolvimento)

---

## Como rodar o projeto

### Pré-requisitos

- Python 3.12+
- pip

### Passo a passo

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd sistema-de-gestao-de-futebol/Back-end

# 2. Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Instale as dependências
pip install django djangorestframework djangorestframework-simplejwt django-channels bcrypt

# 4. Configure as variáveis de ambiente (necessário para envio de email)
export EMAIL_HOST_USER="seu@gmail.com"
export EMAIL_HOST_PASSWORD="senha-de-app-do-google"
export DEFAULT_FROM_EMAIL="seu@gmail.com"
export FRONTEND_URL="http://localhost:3000"

# 5. Gere e aplique as migrations
python manage.py makemigrations
python manage.py migrate

# 6. Suba o servidor
python manage.py runserver
```

O servidor ficará disponível em `http://127.0.0.1:8000`.

> **Dica:** Para desenvolvimento sem email real, altere `EMAIL_BACKEND` em `settings.py` para `django.core.mail.backends.console.EmailBackend`. Os emails serão exibidos no terminal.

---

## Integração com o Front-end

### Base URL

```
http://127.0.0.1:8000
```

### Autenticação

O sistema usa **JWT (JSON Web Token)**. Após login ou registro, o frontend recebe dois tokens:

| Token | Validade | Uso |
|---|---|---|
| `access` | 5 minutos | Enviado no header de cada requisição |
| `refresh` | 1 dia | Usado para gerar um novo `access` quando expirar |

Todas as rotas (exceto registro, login e recuperação de senha) exigem o header:

```
Authorization: Bearer <access_token>
```

---

### Endpoints disponíveis

#### Registro

```
POST /api/register/
```

Body:
```json
{
    "first_name": "Nome",
    "email": "email@exemplo.com",
    "password": "senha123"
}
```

Resposta `201`:
```json
{
    "access": "<token>",
    "refresh": "<token>"
}
```

---

#### Login

```
POST /api/login/
```

Body:
```json
{
    "email": "email@exemplo.com",
    "password": "senha123"
}
```

Resposta `200`:
```json
{
    "access": "<token>",
    "refresh": "<token>"
}
```

---

#### Renovar token de acesso

```
POST /api/token/refresh/
```

Body:
```json
{
    "refresh": "<refresh_token>"
}
```

Resposta `200`:
```json
{
    "access": "<novo_access_token>"
}
```

---

#### Ver perfil

```
GET /api/perfil/
Authorization: Bearer <access_token>
```

Resposta `200`:
```json
{
    "first_name": "Nome",
    "last_name": "Sobrenome",
    "email": "email@exemplo.com"
}
```

---

#### Editar perfil

```
PATCH /api/perfil/
Authorization: Bearer <access_token>
```

Body (todos os campos são opcionais):
```json
{
    "first_name": "Novo Nome",
    "last_name": "Novo Sobrenome",
    "email": "novo@email.com"
}
```

Resposta `200`: perfil atualizado.

---

#### Recuperação de senha

```
POST /api/password/recovery/
```

Body:
```json
{
    "email": "email@exemplo.com"
}
```

O sistema envia um email com um link contendo `uid` e `token`. O link aponta para `FRONTEND_URL/reset-senha?uid=...&token=...`.

---

#### Redefinir senha

```
POST /api/password/reset/
```

Body:
```json
{
    "uid": "<uid_do_link>",
    "token": "<token_do_link>",
    "nova_senha": "novasenha123"
}
```

Resposta `200`:
```json
{
    "detail": "Senha redefinida com sucesso."
}
```

---

### Fluxo de autenticação recomendado (frontend)

```
1. Usuário faz login → salvar access e refresh no localStorage
2. Em cada requisição → enviar Authorization: Bearer <access>
3. Se receber 401 → chamar POST /api/token/refresh/ com o refresh
4. Se refresh também expirar → redirecionar para login
```
