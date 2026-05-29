import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Zap, Droplets, Trash2 } from 'lucide-react';
import logoCzBlack from '../../assets/logos/hk_cr_-logo_cz-logo_zakladni_black.png';
import logoCzWhite from '../../assets/logos/hk_cr_logo_cz-logo_bile.png';
import logoEnBlack from '../../assets/logos/hk_cr_logo_aj_black.png';
import logoEnWhite from '../../assets/logos/hk_cr_logo_aj-logo_white.png';
import LanguageSwitch from '../ui/LanguageSwitch';
import LanguageSwitchAlt from '../ui/LanguageSwitchAlt';

export default function Navbar() {
  const { i18n, t } = useTranslation('common');
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const getTheme = () => {
    switch (location.pathname) {
      case '/electricity':
      case '/electricityaudit':
        return { bg: 'bg-yellow-400', text: 'text-black', border: 'border-black', hover: 'hover:bg-black/10', active: 'bg-black/10 text-black', inactive: 'text-black/70 hover:text-black' };
      case '/water':
      case '/wateraudit':
        return { bg: 'bg-blue-900', text: 'text-white', border: 'border-white', hover: 'hover:bg-white/20', active: 'bg-white/20 text-white', inactive: 'text-white/70 hover:text-white' };
      case '/waste':
      case '/wasteaudit':
        return { bg: 'bg-stone-900', text: 'text-white', border: 'border-white', hover: 'hover:bg-white/15', active: 'bg-white/15 text-white', inactive: 'text-white/70 hover:text-white' };
      default:
        return { bg: 'bg-emerald-900', text: 'text-white', border: 'border-white', hover: 'hover:bg-white/20', active: 'bg-white/20 text-white', inactive: 'text-white/70 hover:text-white' };
    }
  };

  const theme = getTheme();
  const isElectricity = location.pathname === '/electricity' || location.pathname === '/electricityaudit';
  const useBlackLogo = isElectricity;
  const borderBg = theme.border.replace('border-', 'bg-');
  const logoSrc = i18n.language === 'cs'
    ? (useBlackLogo ? logoCzBlack : logoCzWhite)
    : (useBlackLogo ? logoEnBlack : logoEnWhite);

  const navLinks = [
    { path: '/', icon: <Home className="w-[18px] h-[18px] md:w-5 md:h-5" />, label: t('nav.home') },
    { path: '/electricity', icon: <Zap className="w-[18px] h-[18px] md:w-5 md:h-5" />, label: t('nav.electricity') },
    { path: '/water', icon: <Droplets className="w-[18px] h-[18px] md:w-5 md:h-5" />, label: t('nav.water') },
    { path: '/waste', icon: <Trash2 className="w-[18px] h-[18px] md:w-5 md:h-5" />, label: t('nav.waste') },
  ];

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY || 0;
        const isScrollingDown = currentY > lastScrollY.current;
        const shouldHide = isScrollingDown && currentY > 120;

        setHidden(shouldHide);
        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    lastScrollY.current = window.scrollY || 0;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${theme.bg} ${theme.text} transition-all duration-300 sticky top-0 z-50 w-full ${hidden ? '-translate-y-full' : 'translate-y-0'} relative`}>
      <div className="max-w-7xl mx-auto px-1 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-0">
          <Link to="https://www.komora.cz/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="h-10 w-40 flex items-center">
              <img
                src={logoSrc}
                alt={t('footer.alt')}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          
          <div className={`h-6 w-px ${theme.border.replace('border-', 'bg-')} hidden md:block md:ml-2 md:mr-2`}></div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 sm:gap-2 px-1.5 py-2 md:px-3 md:py-2 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === link.path 
                    ? theme.active
                    : `${theme.inactive} ${theme.hover}`
                }`}
              >
                {link.icon}
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <LanguageSwitch
              textClassName={theme.text}
              borderClassName={theme.border}
              hoverClassName={theme.hover}
            />
          </div>
          <div className="hidden md:inline-flex">
            <LanguageSwitchAlt
              textClassName={theme.text}
              borderClassName={theme.border}
              hoverClassName={theme.hover}
              activeClassName={theme.active}
            />
          </div>
        </div>
      </div>
      <div className={`absolute inset-x-0 bottom-0 h-px ${borderBg}`} />
    </nav>
  );
}
