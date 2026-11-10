import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PDVPage } from './pages/PDVPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { HistoricoPage } from './pages/HistoricoPage';
import type { ItemCarrinho } from './types';
import './App.css';

export function App() {
  const [abaAtiva, setAbaAtiva] = useState<'pdv' | 'produtos' | 'historico'>('pdv');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const totalItensNoCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="app-container">
      <Navbar
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        itensCarrinhoQtd={totalItensNoCarrinho}
      />

      <main className="main-content">
        {abaAtiva === 'pdv' && (
          <PDVPage carrinho={carrinho} setCarrinho={setCarrinho} />
        )}
        {abaAtiva === 'produtos' && <ProdutosPage />}
        {abaAtiva === 'historico' && <HistoricoPage />}
      </main>
    </div>
  );
}

export default App;
