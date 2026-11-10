# 🏮 Seinenkai Baiten (PDV & Gestão de Estoque com Leitor de Código de Barras)

Sistema completo de Ponto de Venda (PDV) e controle de estoque desenvolvido com **Node.js (Backend)**, **React (Frontend)**, **MySQL** e orquestrado via **Docker Compose**.

Desenvolvido especialmente para barracas e bazares de eventos (Baiten de Seinenkai), permitindo agilidade no atendimento, baixa automática no estoque e prestação de contas no fechamento do caixa.

---

## 🚀 Como Executar

### Opção 1: Execução Completa com Docker Compose (Recomendado)

Certifique-se de que o Docker e Docker Compose estão instalados em seu computador:

```bash
# Na raiz do projeto:
docker compose up --build
```

Isso irá subir:
1. **MySQL 8.0** na porta `3306` (com as tabelas e produtos de exemplo já criados via `docker/mysql/init.sql`).
2. **Backend API** em Node.js na porta `3001` (`http://localhost:3001/api/health`).
3. **Frontend React (Vite)** na porta `5173` (`http://localhost:5173`).

---

### Opção 2: Execução em Desenvolvimento Local (Host)

Caso queira subir apenas o banco no Docker e rodar o código no seu terminal com hot-reload:

1. **Subir apenas o MySQL no Docker:**
   ```bash
   docker compose up mysql -d
   ```

2. **Iniciar o Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *O backend rodará em `http://localhost:3001`.*

3. **Iniciar o Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Abra no navegador em `http://localhost:5173`.*

---

## 📟 Como Funciona a Leitura de Código de Barras

O sistema foi desenhado para operar com leitores de código de barras USB ou Bluetooth comuns:
- Os leitores funcionam como teclado (dispositivo HID), digitando os números e pressionando `Enter` automaticamente.
- Na tela **Caixa / PDV**, o campo de busca mantém o foco permanente. Basta apontar o leitor para o produto e apertar o gatilho.
- O item é adicionado ao carrinho com som de confirmação (*beep*). Bipar o mesmo item novamente incrementa a quantidade.
- No cadastro de produtos (**Produtos & Estoque**), você também pode simplesmente apontar o leitor para preencher o campo "Código de Barras" sem precisar digitar manualmente.

---

## 📦 Produtos de Exemplo Incluídos no Banco

O script `docker/mysql/init.sql` já inicializa o banco com alguns itens clássicos de Baiten com códigos reais para você testar imediatamente:

| Código de Barras | Produto | Preço | Estoque Inicial |
| :--- | :--- | :--- | :--- |
| `7894900010015` | Coca-Cola Lata 350ml | R$ 6,00 | 50 un |
| `7891991000858` | Guaraná Antarctica Lata 350ml | R$ 6,00 | 45 un |
| `7898080640018` | Água Mineral sem Gás 500ml | R$ 4,00 | 60 un |
| `7891000244105` | Pastel de Carne Especial | R$ 12,00 | 30 un |
| `7891000244112` | Pastel de Queijo | R$ 12,00 | 30 un |
| `7891000244129` | Yakisoba Tradicional | R$ 25,00 | 25 un |
| `7891000244136` | Gyoza Suíno (6 un) | R$ 18,00 | 20 un |
| `7891000244143` | Choux Cream de Baunilha | R$ 10,00 | 20 un |

*(Você pode digitar ou bipar qualquer um desses códigos na tela de PDV para testar).*

---

## 🛠️ Recursos do Sistema

1. **Frente de Caixa (PDV Ágil)**:
   - Entrada rápida via leitor ou digitação.
   - Grade de botões rápidos para itens mais vendidos (Pastel, Bebidas, etc.).
   - Cálculo automático do valor total e quantidade de itens.
   - Modal de pagamento com opções: **Dinheiro**, **PIX**, **Crédito** e **Débito**.
   - Cálculo automático de troco com botões rápidos de cédulas (R$ 10, R$ 20, R$ 50, R$ 100 ou Exato).
   - Som de *beep* sintetizado no leitor (sem arquivos de áudio externos).
2. **Controle de Estoque Transacional (ACID)**:
   - Vendas processadas dentro de transação MySQL (`START TRANSACTION` ... `FOR UPDATE` ... `COMMIT`).
   - Se um produto acabar ou faltar no momento da confirmação, a transação é cancelada (`ROLLBACK`) evitando inconsistências.
   - Registro de histórico e auditoria em `movimentacoes_estoque`.
3. **Gestão de Produtos**:
   - Cadastro, edição e desativação de itens.
   - Alertas visuais de estoque baixo (amarelo) e esgotado (vermelho).
   - Botões de ajuste rápido de estoque (`+5`, `+10`).
4. **Histórico e Fechamento de Caixa**:
   - Faturamento total do evento.
   - Discriminação do valor apurado em Dinheiro, PIX e Cartão.
   - Botão para impressão do relatório de fechamento de caixa (`window.print`).

