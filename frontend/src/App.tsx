import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CopilotDrawer } from './components/CopilotDrawer';

// Views
import { DashboardView } from './views/DashboardView';
import { IncidentWarRoomView } from './views/IncidentWarRoomView';
import { GraphExplorerView } from './views/GraphExplorerView';
import { SuppliersView } from './views/SuppliersView';
import { ShipmentsView } from './views/ShipmentsView';
import { OrdersView } from './views/OrdersView';
import { AgentActivityView } from './views/AgentActivityView';
import { DecisionSimView } from './views/DecisionSimView';
import { CompanyBrainView } from './views/CompanyBrainView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeSection } = useApp();

  const renderCurrentView = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'incidents':
        return <IncidentWarRoomView />;
      case 'graph':
        return <GraphExplorerView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'shipments':
        return <ShipmentsView />;
      case 'orders':
        return <OrdersView />;
      case 'agents':
        return <AgentActivityView />;
      case 'decisions':
        return <DecisionSimView />;
      case 'history':
        return <CompanyBrainView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content-viewport">
          {renderCurrentView()}
        </main>
      </div>
      <CopilotDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
