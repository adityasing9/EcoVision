import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { IdentifyPage } from "./pages/IdentifyPage";
import { JournalPage } from "./pages/JournalPage";
import { MapPage } from "./pages/MapPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SpeciesExplorerPage } from "./pages/SpeciesExplorerPage";
import { SpeciesDetailPage } from "./pages/SpeciesDetailPage";
import { AboutPage } from "./pages/AboutPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-parchment-50 font-sans text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/species" element={<SpeciesExplorerPage />} />
              <Route path="/species/:id" element={<SpeciesDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
