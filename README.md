# ArchFlow

## Visão Geral

Este repositório contém a aplicação **ArchFlow** – architecture-driven project management.

O projeto foi migrado de **Vite** para **Next.js 15** com App Router, seguindo uma arquitetura enterprise com estrutura baseada em features.

### Tecnologias

* **Next.js 15** (App Router)
* **React 19**
* **Tailwind CSS**
* **Recharts**
* **Axios** (service layer)
* **Zod** (validation)
* **shadcn/ui** (componentes base)

### Estrutura do Projeto

```
src
├── app/              # Next.js App Router (rotas, layouts)
├── views/            # Componentes de página (ex-“pages”)
├── components/       # Componentes reutilizáveis (ui, charts, layout, …)
├── features/         # Lógica de domínio por feature
├── services/         # Camada de API (Axios)
├── hooks/            # Hooks reutilizáveis
├── lib/              # Utilitários, http-client, schemas
├── types/            # Tipos TypeScript compartilhados
└── contexts/         # Contextos React
```

### Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

---

## Histórico: Preview de Design

Este projeto evoluiu de um **preview de design** para uma aplicação estruturada.

O objetivo original era demonstrar e validar:

* Interface do usuário (UI)
* Fluxos de navegação
* Estrutura das telas
* Organização visual do produto
* Experiência de uso para Scrum e Kanban

Esta implementação **não representa a aplicação final**.

---

## Objetivo do Repositório

Este projeto foi criado para servir como um **protótipo visual da aplicação**, permitindo validar o design antes da implementação completa do sistema.

Isso permite:

* validar o layout das telas
* testar fluxos de navegação
* experimentar decisões de UX
* ajustar a identidade visual do produto
* alinhar design e desenvolvimento

Por esse motivo, diversas funcionalidades utilizam **dados mockados (mocks)** e **comportamentos simulados**.

---

## Aviso Importante

Este repositório **não contém a implementação real da aplicação**.

Ele deve ser considerado apenas como um **preview de interface**.

Limitações deste projeto:

* uso de **dados mockados**
* algumas interações são apenas **visuais**
* **não há integração com API**
* **não possui arquitetura de produção**

---

## Implementação Futura

A aplicação real será desenvolvida em um **repositório separado**, utilizando uma arquitetura adequada para produção.

Tecnologias previstas:

* **Next.js** para o frontend
* comunicação com **API backend**
* arquitetura organizada e escalável
* separação clara de responsabilidades
* gerenciamento adequado de estado e dados

Nesta implementação final, todos os dados serão carregados por meio de **requisições para APIs**, substituindo os mocks utilizados neste preview.

---

## Escopo deste Preview

Este preview demonstra o design e os fluxos de telas como:

* Navegação entre projetos
* Product Backlog
* Tela de Sprint
* Sprint Backlog
* Quadro Kanban
* Gráfico de Burndown
* Métricas de Sprint
* Estados de tela (vazio, carregamento, etc.)

O foco principal é validar **layout, hierarquia visual e experiência de uso**.

---

## Por que criar um preview de design primeiro?

Criar um preview de interface antes da implementação completa permite:

* validar ideias rapidamente
* reduzir retrabalho na implementação final
* alinhar design e engenharia
* melhorar a experiência do produto antes da construção real

---

## Resumo

Este repositório existe para **validar o design e a experiência do produto**.

A **aplicação real será desenvolvida posteriormente**, utilizando **Next.js**, arquitetura adequada e integração completa com APIs.
