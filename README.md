# 📈 LifeTrack - Gestão Inteligente de Hábitos e Finanças  

O **LifeTrack** é uma aplicação **full-stack** desenvolvida para resolver dois pilares fundamentais do desenvolvimento pessoal:

- 📈 Manutenção de hábitos produtivos  
- 💰 Saúde financeira  

O objetivo é oferecer uma visão clara de **onde seu tempo e seu dinheiro estão sendo investidos**.

---

# 🎯 Expectativas do Projeto

Este projeto foi concebido sob uma ótica de **Engenharia de Software**, priorizando:

- Escalabilidade  
- Tipagem forte  
- Segurança de dados  

## 1️⃣ Pilar Financeiro (Finanças)

- **Controle de Fluxo:** Registro preciso de entradas (*Income*) e saídas (*Expense*).  
- **Segurança de Dados:** Isolamento completo de dados por usuário via JWT.  
- **Inteligência Financeira:** Cálculo automático de saldo e resumo mensal.  

### 📊 Cálculo do Saldo Geral

```math
Saldo = ∑(Entradas) - ∑(Saídas)
```

Ou:

\[
Saldo = \sum (Entradas) - \sum (Saídas)
\]

---

## 2️⃣ Pilar de Hábitos (Habits)

- **Monitoramento de Consistência:** Registro de atividades diárias e acompanhamento de *streaks* (sequências).  
- **Feedback Visual:** Dashboard para identificar padrões de comportamento e progresso a longo prazo.  

---

## 3️⃣ Excelência Técnica

- **Arquitetura:** Backend modular com NestJS.  
- **Persistência:** Prisma 7 + PostgreSQL.  
- **Qualidade:** Validação rigorosa de dados (DTOs) e tratamento estruturado de exceções.  

---

# 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Backend** | NestJS (Node.js) |
| **Banco de Dados** | PostgreSQL + Prisma 7 (ORM) |
| **Linguagem** | TypeScript |
| **Autenticação** | JWT (JSON Web Tokens) + Passport |
| **Frontend** | Next.js / React *(Em desenvolvimento)* |
| **Infraestrutura** | Docker (PostgreSQL container) |

---

# 🏗️ Estrutura do Backend

A API segue o padrão modular do NestJS:

- **Auth:** Gerenciamento de login e emissão de tokens.  
- **Users:** Cadastro e perfil de usuários.  
- **Transactions:** Operações CRUD de finanças com filtro por usuário.  
- **Habits:** Gestão de hábitos e progresso.  
- **Common:** Interfaces e tipos compartilhados para consistência de código.  

---

# 📈 Próximos Passos (Roadmap)

- [x] CRUD de Transações com filtro de usuário  
- [x] Migração para Prisma 7 com Driver Adapter  
- [x] Implementação do endpoint de Resumo Financeiro (Saldo Total)  
- [x] Desenvolvimento do módulo de Hábitos (Habit Tracking)  
- [x] Integração com o Frontend em Next.js  
- [ ] Implementação de Gráficos de Evolução