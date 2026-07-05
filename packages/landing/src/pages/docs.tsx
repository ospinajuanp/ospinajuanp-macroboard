import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Docs() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-macroboard-dark">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white">
            {t('nav.docs')}
          </h1>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-macroboard-primary">
                Quick Start
              </h2>
              <ol className="space-y-4 text-slate-300">
                <li className="flex gap-3">
                  <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">1</span>
                  <div>
                    <p><strong>Clone the repository</strong></p>
                    <code className="text-sm text-slate-400">git clone https://github.com/ospinajuanp/ospinajuanp-macroboard.git</code>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">2</span>
                  <div>
                    <p><strong>Install dependencies</strong></p>
                    <code className="text-sm text-slate-400">pnpm install</code>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">3</span>
                  <div>
                    <p><strong>Start the development server</strong></p>
                    <code className="text-sm text-slate-400">pnpm dev</code>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-macroboard-primary">
                OBS Configuration
              </h2>
              <p className="text-slate-300 mb-4">
                The server connects to OBS via WebSocket. Make sure OBS is running with the WebSocket plugin enabled.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Enable WebSocket in OBS Settings → General</li>
                <li>Set a password if desired</li>
                <li>Default port is 4455</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-macroboard-primary">
                Building for Production
              </h2>
              <p className="text-slate-300 mb-4">
                To create the Windows executable:
              </p>
              <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-slate-300">
                  pnpm clean && pnpm build && pnpm package
                </code>
              </pre>
              <p className="text-slate-400 text-sm mt-4">
                The executable will be created in <code className="bg-slate-700 px-1 rounded">packages/server/dist/</code>
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-4 text-macroboard-primary">
                Environment Variables
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <code className="text-sm bg-slate-700 px-2 py-1 rounded text-slate-300">OBS_WEBSOCKET_PORT</code>
                  <span className="text-slate-400 text-sm">OBS WebSocket port (default: 4455)</span>
                </div>
                <div className="flex flex-col gap-2">
                  <code className="text-sm bg-slate-700 px-2 py-1 rounded text-slate-300">OBS_WEBSOCKET_PASSWORD</code>
                  <span className="text-slate-400 text-sm">OBS WebSocket password (if set)</span>
                </div>
                <div className="flex flex-col gap-2">
                  <code className="text-sm bg-slate-700 px-2 py-1 rounded text-slate-300">SERVER_PORT</code>
                  <span className="text-slate-400 text-sm">HTTP server port (default: 3000)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
