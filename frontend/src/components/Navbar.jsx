import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Plus, Settings, LogOut, Briefcase, Wallet, Menu, X, Moon, Sun } from 'lucide-react';
import { authService, userService } from '../services/api';
import WalletModal from './WalletModal';
import UpgradeModal from './UpgradeModal';
export default function Navbar({ user, onLogout, onOpenSettings, onUserUpdate }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({ total: 0, unreadMessages: 0, pendingJobs: 0 });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifs = async () => {
      try {
        const data = await userService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 bg-surface-bright h-16 shadow-sm border-b border-outline">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          className="md:hidden p-1 text-on-surface hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary cursor-pointer">
          <span>Hire Me</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {user?.role === 'ADMIN' ? (
            <Link to="/admin-dashboard" className="text-primary font-bold border-b-2 border-primary pb-1 text-sm">Admin Dashboard</Link>
          ) : (
            <Link to="/" className="text-primary font-bold border-b-2 border-primary pb-1 text-sm">Find Services</Link>
          )}
          {user?.role === 'CLIENT' && (
            <button onClick={() => setIsUpgradeModalOpen(true)} className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 text-sm">
              Become a Professional
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
          <button onClick={() => setIsWalletOpen(true)} className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">Wallet</span>
            <span className="text-sm font-black">{user.wallet_balance || 0} FCFA</span>
          </button>

          {isWalletOpen && (
            <WalletModal 
              isOpen={isWalletOpen} 
              onClose={() => setIsWalletOpen(false)} 
              currentBalance={user.wallet_balance || 0}
              onTopUpSuccess={(newBalance) => {
                onUserUpdate({ wallet_balance: newBalance });
                setIsWalletOpen(false);
              }}
            />
          )}

          {isUpgradeModalOpen && (
            <UpgradeModal 
              isOpen={isUpgradeModalOpen} 
              onClose={() => setIsUpgradeModalOpen(false)} 
              onUpgradeSuccess={(res) => {
                onUserUpdate(res.user);
                navigate('/provider-dashboard');
                window.location.reload();
              }}
            />
          )}

          <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-on-surface-variant hover:text-primary transition-colors p-2 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.total > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border border-surface-bright animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-12 right-0 w-72 bg-surface-bright rounded-xl shadow-lg border border-outline overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-outline bg-surface-container flex justify-between items-center">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Notifications</h4>
                    {notifications.total > 0 && (
                      <span className="text-[10px] bg-error/10 text-error font-bold px-2 py-0.5 rounded-full">
                        {notifications.total} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.total === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-xs text-on-surface-variant">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-outline">
                        {notifications.unreadMessages > 0 && (
                          <div className="p-4 hover:bg-surface-container transition-colors flex gap-3 cursor-pointer" onClick={() => setShowNotifications(false)}>
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-on-surface">New Messages</h5>
                              <p className="text-xs text-on-surface-variant mt-0.5">You have {notifications.unreadMessages} unread chat messages.</p>
                            </div>
                          </div>
                        )}
                        {notifications.pendingJobs > 0 && (
                          <div className="p-4 hover:bg-surface-container transition-colors flex gap-3 cursor-pointer" onClick={() => setShowNotifications(false)}>
                            <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-on-surface">Pending Jobs</h5>
                              <p className="text-xs text-on-surface-variant mt-0.5">You have {notifications.pendingJobs} new booking requests to review.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 hidden md:block">
              <MessageSquare className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="text-on-surface-variant hover:text-primary transition-colors p-2"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full overflow-hidden border border-outline focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute top-12 right-0 w-48 bg-surface-bright rounded-xl shadow-lg border border-outline overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-outline bg-surface-container">
                    <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                    <p className="text-xs text-primary font-medium">{user.role}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); setIsWalletOpen(true); }}
                      className="w-full text-left px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-2 transition-colors font-bold md:hidden"
                    >
                      <Wallet className="w-4 h-4" /> Wallet: {user.wallet_balance || 0} FCFA
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); onOpenSettings(); }}
                      className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-on-surface-variant" /> Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="text-on-surface-variant hover:text-primary transition-colors p-2 hidden md:block"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all">
              Log In
            </Link>
          </>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-surface-bright border-b border-outline shadow-lg md:hidden animate-in fade-in slide-in-from-top-4 flex flex-col">
          <nav className="flex flex-col p-4 gap-4">
            {user?.role === 'ADMIN' ? (
              <Link to="/admin-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-bold text-base px-2 py-1 rounded-md hover:bg-surface-container">Admin Dashboard</Link>
            ) : (
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-bold text-base px-2 py-1 rounded-md hover:bg-surface-container">Find Services</Link>
            )}
            {user?.role === 'CLIENT' && (
              <div className="py-2">
                <button onClick={() => { setIsMobileMenuOpen(false); setIsUpgradeModalOpen(true); }} className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 text-left px-2 py-1 text-base">
                  Become a Professional
                </button>
              </div>
            )}
            {!user && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 text-left px-2 py-1 text-base">
                Log In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
