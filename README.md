# 🚗 ORA - Sistema de Gestão de Frota

O **ORA** é uma plataforma moderna e responsiva para aluguel e gestão de veículos, desenvolvida com tecnologia de ponta para otimizar o controle da sua frota.

## ✨ Funcionalidades Principais

*   **Dashboard Intuitivo**: Visão geral de faturamento, carros alugados e manutenções.
*   **Gestão de Frota (Fleet Manager)**: Cadastro detalhado de veículos com fotos reais (estilo Studio) e status em tempo real.
*   **Controle de Aluguéis**: Fluxo de criação de contratos, cálculo automático de diárias e controle de prazos.
*   **Financeiro Premium**:
    *   Módulo de Cobrança com abas "Pendentes" e "Histórico".
    *   Baixa de pagamentos facilitada (Pix, Cartão, Dinheiro).
    *   Envio de cobranças via WhatsApp com um clique.
    *   Modal de detalhes financeiros com cálculo de saldo devedor.
*   **Gestão de Clientes**: Cadastro completo com upload de CNH e comprovante de residência.

## 🚀 Tecnologias Utilizadas

*   **Frontend**: React, TypeScript, Vite
*   **Estilização**: CSS Modules, Lucide React (Ícones), Glassmorphism UI
*   **Backend/Banco de Dados**: Supabase (PostgreSQL, Auth, Storage)

## 📦 Como Implantar no Vercel

Este projeto já está configurado para ser implantado na **Vercel** em poucos cliques.

### 1️⃣ Importar Projeto
acesse [vercel.com/new](https://vercel.com/new) e importe o repositório do GitHub `moacyfilho/ora`.

### 2️⃣ Configurar Variáveis de Ambiente
Na tela de configuração ("Configure Project"), adicione as seguintes variáveis na seção **Environment Variables**:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://cgyzpgzxemqapkkmgpwq.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_hSubVT6w_xhS7Osllg_Qqw_4mezKhAN` |

> **Nota:** Assegure-se de copiar os valores exatos acima para garantir a conexão com o banco de dados.

### 3️⃣ Deploy
Clique em **Deploy** e aguarde alguns segundos. Seu sistema estará online!

## 🔐 Acesso ao Sistema

*   **Link do Repositório**: [github.com/moacyfilho/ora](https://github.com/moacyfilho/ora)
*   **Login Admin Padrão**:
    *   Usuário: `Ot@vio2026`
    *   Senha: `Jordan31@`

---
Desenvolvido por **Antigravity** para ORA Cars.
