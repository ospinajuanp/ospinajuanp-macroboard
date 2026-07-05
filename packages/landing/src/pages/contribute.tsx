import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Contribute() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-macroboard-dark">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white">
            {t('nav.contribute')}
          </h1>

          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-macroboard-primary">
              Welcome to the Project
            </h2>
            <p className="text-slate-300 leading-relaxed">
              ospinajuanp-macroboard is an open source project and we welcome contributions from developers of all skill levels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-macroboard-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Development Setup
              </h3>
              <pre className="bg-slate-900 rounded-lg p-3 text-sm overflow-x-auto">
                <code className="text-slate-300">
                  git clone https://github.com/ospinajuanp/ospinajuanp-macroboard.git{'\n'}
                  cd ospinajuanp-macroboard{'\n'}
                  pnpm install{'\n'}
                  pnpm dev
                </code>
              </pre>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-macroboard-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Branch Strategy
              </h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><code className="bg-slate-700 px-1 rounded">main</code> - Stable release</li>
                <li><code className="bg-slate-700 px-1 rounded">develop</code> - Next release</li>
                <li><code className="bg-slate-700 px-1 rounded">feature/*</code> - New features</li>
                <li><code className="bg-slate-700 px-1 rounded">fix/*</code> - Bug fixes</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-macroboard-primary">
              Ways to Contribute
            </h2>
            <div className="space-y-4">
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-medium text-white mb-2">Report Bugs</h3>
                <p className="text-slate-400 text-sm">
                  Open an issue on GitHub with detailed information about the bug and how to reproduce it.
                </p>
              </div>
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-medium text-white mb-2">Suggest Features</h3>
                <p className="text-slate-400 text-sm">
                  Have an idea? Open an issue with the label &quot;enhancement&quot; and describe your feature request.
                </p>
              </div>
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-medium text-white mb-2">Submit Code</h3>
                <p className="text-slate-400 text-sm">
                  Fork the repository, create a branch, make your changes, and submit a pull request.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Improve Documentation</h3>
                <p className="text-slate-400 text-sm">
                  Help us improve the docs by submitting corrections or new content.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-macroboard-primary/20 to-macroboard-secondary/20 rounded-2xl p-8 border border-macroboard-primary/30 text-center">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Ready to contribute?
            </h2>
            <p className="text-slate-300 mb-6">
              Check out our GitHub repository and start contributing today.
            </p>
            <a
              href="https://github.com/ospinajuanp/ospinajuanp-macroboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-macroboard-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
