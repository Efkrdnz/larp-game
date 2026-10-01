import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { startLoop, useGame } from './store/useGame';
import AppShell from './ui/layout/AppShell';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import StockPage from './pages/StockPage';
import News from './pages/News';
import Portfolio from './pages/Portfolio';
import Shop from './pages/Shop';
import ShopItemPage from './pages/ShopItemPage';
import Garage from './pages/Garage';
import Casino from './pages/Casino';
import Underworld from './pages/Underworld';
import Taxes from './pages/Taxes';
import Court from './pages/Court';
import Jail from './pages/Jail';
import Settings from './pages/Settings';
import Inbox from './pages/Inbox';

export default function App() {
  const loaded = useGame((s) => s.loaded);
  const hasGame = useGame((s) => s.game !== null);

  useEffect(() => {
    void useGame.getState().load();
    return startLoop();
  }, []);

  if (!loaded) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="font-display text-2xl font-bold tracking-[0.3em] text-gold-500">CAPITAL</div>
      </div>
    );
  }
  if (!hasGame) return <Onboarding />;

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<Market />} />
        <Route path="/stock/:ticker" element={<StockPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ShopItemPage />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/casino" element={<Casino />} />
        <Route path="/underworld" element={<Underworld />} />
        <Route path="/taxes" element={<Taxes />} />
        <Route path="/court" element={<Court />} />
        <Route path="/jail" element={<Jail />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
