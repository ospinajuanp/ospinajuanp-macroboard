import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-macroboard-dark/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-macroboard-primary to-macroboard-secondary bg-clip-text text-transparent">
          ospinajuanp-macroboard
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/docs" className="text-slate-300 hover:text-white transition-colors">
              {t('nav.docs')}
            </Link>
            <Link href="/contribute" className="text-slate-300 hover:text-white transition-colors">
              {t('nav.contribute')}
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
