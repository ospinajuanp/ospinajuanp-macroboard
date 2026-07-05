import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-macroboard-dark">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <section className="py-24 px-6 bg-gradient-to-b from-macroboard-dark to-slate-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
              {t('sections.howItWorks')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <div className="w-12 h-12 bg-macroboard-primary/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Run the Server</h3>
                <p className="text-slate-400">
                  Start the desktop server on your streaming PC and connect to OBS.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <div className="w-12 h-12 bg-macroboard-secondary/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Configure Buttons</h3>
                <p className="text-slate-400">
                  Use the admin panel to create buttons for scenes, hotkeys, and macros.
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <div className="w-12 h-12 bg-macroboard-accent/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Control from Mobile</h3>
                <p className="text-slate-400">
                  Scan the QR code and control your stream from any device.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
