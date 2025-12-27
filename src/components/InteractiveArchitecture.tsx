/** @jsxImportSource react */
import { motion } from 'framer-motion';
import { Database, FileText, Server, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InteractiveArchitecture() {
  const [activeFlow, setActiveFlow] = useState<'safe' | 'threat'>('safe');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow(prev => prev === 'safe' ? 'threat' : 'safe');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isThreat = activeFlow === 'threat';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section className="py-24 overflow-hidden relative">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text Side */}
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Visualizing the <span className="text-primary">Flow</span>
            </h2>
            <p className="text-text-muted text-lg mb-8 leading-relaxed">
              Tracehound intercepts requests <strong>after</strong> the WAF but <strong>before</strong> your application logic.
              It acts as a high-performance sieve, letting safe traffic pass instantly while detaining suspicious payloads for audit.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setActiveFlow('safe')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${!isThreat ? 'bg-primary/20 border-primary text-primary' : 'border-surface-highlight text-text-muted hover:text-white'}`}
              >
                Safe Request
              </button>
              <button
                onClick={() => setActiveFlow('threat')}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isThreat ? 'bg-accent/20 border-accent text-accent' : 'border-surface-highlight text-text-muted hover:text-white'}`}
              >
                Threat Detected
              </button>
            </div>
          </div>

          {/* Animation Side */}
          <div className="flex-1 w-full max-w-2xl bg-surface/50 rounded-2xl border border-surface-highlight p-8 relative min-h-[400px] flex items-center justify-center">

            {/* Flow Diagram */}
            <div className="relative w-full flex items-center justify-between z-10">

              {/* Client */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isThreat ? 'border-accent bg-accent/10 text-accent' : 'border-primary bg-primary/10 text-primary'}`}>
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-sm font-mono text-text-muted">Request</span>
              </div>

              {/* Animated Dot */}
              <motion.div
                key={activeFlow}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 280, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                className={`absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] z-20 ${isThreat ? 'bg-accent text-accent' : 'bg-primary text-primary'}`}
              />

              {/* Tracehound Agent */}
              <div className="flex flex-col items-center gap-2 relative">
                <div className="w-24 h-24 rounded-xl border-2 border-surface-highlight bg-surface flex items-center justify-center relative backdrop-blur-sm z-10">
                  <img src="/logo.svg" alt="" className="w-12 h-12 opacity-50" />
                  <div className="absolute inset-0 border-t-2 border-primary/50 animate-pulse rounded-xl"></div>
                </div>
                <span className="text-sm font-mono font-bold text-white">Tracehound</span>

                {/* Quarantine Path (Down) */}
                <motion.div
                  animate={{ opacity: isThreat ? 1 : 0.1, scale: isThreat ? 1 : 0.9 }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 pt-8 flex flex-col items-center gap-2"
                >
                  <div className="h-8 w-0.5 bg-accent/50 dash-line"></div>
                  <div className="w-16 h-16 rounded-lg border border-accent/50 bg-accent/10 flex items-center justify-center text-accent">
                    <Database className="w-8 h-8" />
                  </div>
                  <span className="text-xs text-accent font-mono mt-1">Quarantine</span>
                </motion.div>
              </div>

              {/* App Server */}
              <div className="flex flex-col items-center gap-2 relative">
                <motion.div
                  animate={{ opacity: !isThreat ? 1 : 0.3 }}
                  className="w-16 h-16 rounded-lg border-2 border-surface-highlight bg-surface flex items-center justify-center text-white"
                >
                  <Server className="w-8 h-8" />
                </motion.div>
                <span className="text-sm font-mono text-text-muted">App Server</span>

                {/* Success Indicator */}
                {!isThreat && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, delay: 1.5 }}
                    className="absolute -top-8 right-0 text-primary"
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </motion.div>
                )}

                {/* Blocked Indicator */}
                {isThreat && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
                    className="absolute top-8 -left-12 text-accent flex items-center gap-1 whitespace-nowrap"
                  >
                    <ShieldAlert className="w-5 h-5" />
                    <span className="text-xs font-bold">BLOCKED</span>
                  </motion.div>
                )}
              </div>

            </div>

            {/* Background connection line */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-surface-highlight -z-0"></div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .dash-line {
            background-image: linear-gradient(to bottom, currentColor 50%, transparent 50%);
            background-size: 1px 10px;
        }
      `}</style>
    </section>
  );
}
