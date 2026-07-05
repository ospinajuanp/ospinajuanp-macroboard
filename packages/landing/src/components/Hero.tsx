import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-macroboard-primary/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-macroboard-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-macroboard-accent/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-300">Open Source</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>

        <p className="text-xl md:text-2xl text-macroboard-primary font-medium mb-4">
          {t('hero.subtitle')}
        </p>

        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#features"
            className="px-8 py-4 bg-gradient-to-r from-macroboard-primary to-macroboard-secondary rounded-xl font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-macroboard-primary/25"
          >
            {t('hero.cta')}
          </a>
          <a
            href="https://github.com/ospinajuanp/ospinajuanp-macroboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            {t('hero.ctaSecondary')}
          </a>
        </div>
      </div>
    </section>
  );
}
