import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Compass,
  Camera,
  BookOpen,
  Map as MapIcon,
  BarChart3,
  Feather,
  Info,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { AuthModal } from "./AuthModal";

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Identify Bird", path: "/identify", icon: Camera },
    { label: "Field Journal", path: "/journal", icon: BookOpen },
    { label: "Biodiversity Map", path: "/map", icon: MapIcon },
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Species Explorer", path: "/species", icon: Feather },
    { label: "Responsible AI", path: "/about", icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-nature-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-nature-800 text-nature-100 flex items-center justify-center shadow-md group-hover:bg-nature-700 transition">
              <Compass className="w-5 h-5 text-nature-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl text-nature-950 tracking-tight">
                  EcoVision
                </span>
                <span className="text-[10px] font-mono font-semibold bg-nature-100 text-nature-800 px-1.5 py-0.2 rounded border border-nature-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-sans text-slate-500 tracking-wider uppercase font-medium">
                Biodiversity Monitoring
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    active
                      ? "bg-nature-100/80 text-nature-900 border border-nature-200"
                      : "text-slate-600 hover:text-nature-800 hover:bg-parchment-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-nature-700" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-nature-50 border border-nature-200 flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-nature-700" />
                  <span className="font-medium text-nature-900 truncate max-w-[120px]">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-nature-800 hover:bg-nature-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Field Account</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-nature-200 px-4 pt-2 pb-6 space-y-2 shadow-xl">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? "bg-nature-100 text-nature-900 font-bold"
                      : "text-slate-700 hover:bg-parchment-100"
                  }`}
                >
                  <Icon className="w-4 h-4 text-nature-700" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-600">
                    Logged in as <strong>{user.email}</strong>
                  </span>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-nature-800 text-white font-semibold text-xs text-center"
                >
                  Sign In / Field Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
