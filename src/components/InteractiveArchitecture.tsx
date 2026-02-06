/** @jsxImportSource react */
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileWarning,
  Fingerprint,
  Gauge,
  Server,
  Shield,
  Snowflake,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type FlowStep = 'idle' | 'scent' | 'rateLimit' | 'signature' | 'agent' | 'result'
type FlowType = 'clean' | 'threat'

interface PipelineStep {
  id: FlowStep
  label: string
  icon: React.ElementType
  description: string
}

const pipelineSteps: PipelineStep[] = [
  {
    id: 'scent',
    label: 'Scent',
    icon: FileWarning,
    description: 'Request captured as immutable Scent object',
  },
  {
    id: 'rateLimit',
    label: 'Rate Check',
    icon: Gauge,
    description: 'Token bucket rate limiting per source',
  },
  {
    id: 'signature',
    label: 'Signature',
    icon: Fingerprint,
    description: 'SHA-256 content signature generated',
  },
  { id: 'agent', label: 'Agent', icon: Shield, description: 'External threat signal evaluated' },
]

export default function InteractiveArchitecture() {
  const [flowType, setFlowType] = useState<FlowType>('clean')
  const [currentStep, setCurrentStep] = useState<FlowStep>('idle')
  const [isAnimating, setIsAnimating] = useState(false)

  const runAnimation = (type: FlowType) => {
    if (isAnimating) return
    setFlowType(type)
    setIsAnimating(true)
    setCurrentStep('idle')

    const steps: FlowStep[] = ['scent', 'rateLimit', 'signature', 'agent', 'result']
    let i = 0

    const interval = setInterval(() => {
      if (i < steps.length) {
        setCurrentStep(steps[i])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsAnimating(false)
          setCurrentStep('idle')
        }, 2000)
      }
    }, 800)
  }

  // Auto-run on mount
  useEffect(() => {
    const timeout = setTimeout(() => runAnimation('clean'), 500)
    return () => clearTimeout(timeout)
  }, [])

  const getStepState = (stepId: FlowStep) => {
    const stepOrder = ['idle', 'scent', 'rateLimit', 'signature', 'agent', 'result']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepId)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const isClean = flowType === 'clean'

  return (
    <section className="py-24 overflow-hidden bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How <span className="text-primary">Tracehound</span> Works
          </h2>
          <p className="text-text-muted text-lg">
            Every request flows through a deterministic pipeline. No decisions. No variance. Just
            security.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => runAnimation('clean')}
            disabled={isAnimating}
            className={`px-6 py-3 rounded-sm border text-sm font-medium transition-all flex items-center gap-2 ${
              !isAnimating
                ? 'border-primary/50 text-primary hover:bg-primary/10'
                : 'border-surface-highlight text-text-muted cursor-not-allowed'
            }`}>
            <CheckCircle2 className="w-4 h-4" />
            Simulate Clean Request
          </button>
          <button
            onClick={() => runAnimation('threat')}
            disabled={isAnimating}
            className={`px-6 py-3 rounded-sm border text-sm font-medium transition-all flex items-center gap-2 ${
              !isAnimating
                ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                : 'border-surface-highlight text-text-muted cursor-not-allowed'
            }`}>
            <XCircle className="w-4 h-4" />
            Simulate Threat
          </button>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative bg-surface/30 border border-dashed border-surface-highlight rounded-sm p-8 md:p-12">
          {/* Main Pipeline */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
            {pipelineSteps.map((step, index) => {
              const state = getStepState(step.id)
              const Icon = step.icon

              return (
                <div key={step.id} className="flex items-center gap-2 md:gap-4">
                  {/* Step Node */}
                  <motion.div
                    animate={{
                      scale: state === 'active' ? 1.1 : 1,
                      borderColor:
                        state === 'completed'
                          ? isClean
                            ? '#F2C94C'
                            : '#ef4444'
                          : state === 'active'
                            ? isClean
                              ? '#F2C94C'
                              : '#ef4444'
                            : '#2a2a2a',
                    }}
                    className="relative flex flex-col items-center">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        state === 'completed'
                          ? isClean
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-red-500/20 border-red-500 text-red-400'
                          : state === 'active'
                            ? isClean
                              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(242,201,76,0.3)]'
                              : 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'bg-surface border-surface-highlight text-text-muted'
                      }`}>
                      <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span
                      className={`mt-2 text-xs md:text-sm font-mono font-medium transition-colors ${
                        state !== 'pending' ? 'text-white' : 'text-text-muted'
                      }`}>
                      {step.label}
                    </span>

                    {/* Description tooltip on active */}
                    <AnimatePresence>
                      {state === 'active' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-text-muted bg-background/90 px-3 py-1.5 rounded border border-surface-highlight">
                          {step.description}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Arrow between steps */}
                  {index < pipelineSteps.length - 1 && (
                    <ArrowRight
                      className={`w-5 h-5 hidden md:block transition-colors ${
                        getStepState(pipelineSteps[index + 1].id) !== 'pending'
                          ? isClean
                            ? 'text-primary'
                            : 'text-red-400'
                          : 'text-surface-highlight'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Result Section */}
          <div className="mt-16 pt-8 border-t border-dashed border-surface-highlight">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {/* Clean Path */}
              <motion.div
                animate={{
                  opacity: currentStep === 'result' && isClean ? 1 : 0.3,
                  scale: currentStep === 'result' && isClean ? 1.05 : 1,
                }}
                className="flex flex-col items-center gap-3">
                <div
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                    currentStep === 'result' && isClean
                      ? 'border-primary bg-primary/20 text-primary shadow-[0_0_30px_rgba(242,201,76,0.4)]'
                      : 'border-surface-highlight bg-surface text-text-muted'
                  }`}>
                  <Server className="w-8 h-8" />
                </div>
                <span className="text-sm font-mono font-bold text-primary">PASS → App</span>
                <span className="text-xs text-text-muted">Request proceeds normally</span>
              </motion.div>

              {/* Divider */}
              <div className="text-2xl text-surface-highlight font-light hidden md:block">or</div>

              {/* Threat Path */}
              <motion.div
                animate={{
                  opacity: currentStep === 'result' && !isClean ? 1 : 0.3,
                  scale: currentStep === 'result' && !isClean ? 1.05 : 1,
                }}
                className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                      currentStep === 'result' && !isClean
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-surface-highlight bg-surface text-text-muted'
                    }`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 ${!isClean ? 'text-red-400' : 'text-surface-highlight'}`}
                  />
                  <div
                    className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                      currentStep === 'result' && !isClean
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-surface-highlight bg-surface text-text-muted'
                    }`}>
                    <Snowflake className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-red-400">
                  QUARANTINE → Cold Storage
                </span>
                <span className="text-xs text-text-muted">Evidence preserved, request blocked</span>
              </motion.div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-primary animate-pulse' : 'bg-surface-highlight'}`}
            />
            <span className="text-xs font-mono text-text-muted">
              {isAnimating ? 'Processing...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
