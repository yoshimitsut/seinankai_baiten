export interface Produto {
  id: number;
  codigo_barras: string;
  nome: string;
  descricao?: string;
  preco_venda: number;
  preco_custo: number;
  estoque_atual: number;
  estoque_minimo: number;
  categoria: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'OUTRO';

export interface ItemVendaInput {
  produto_id: number;
  quantidade: number;
}

export interface ItemVendaCalculado {
  produto_id: number;
  nome: string;
  codigo_barras: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface CreateVendaDTO {
  forma_pagamento: FormaPagamento;
  valor_pago?: number;
  observacoes?: string;
  itens: ItemVendaInput[];
}

export interface Venda {
  id: number;
  codigo_venda: string;
  valor_total: number;
  valor_pago: number;
  troco: number;
  forma_pagamento: FormaPagamento;
  status: 'CONCLUIDA' | 'CANCELADA';
  observacoes?: string;
  criado_em: string;
  itens?: ItemVendaCalculado[];
}

