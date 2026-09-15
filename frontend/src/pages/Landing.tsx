import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  GitCompare,
  MessageSquare,
  Scale,
  Shield,
  Sparkles,
  Upload,
  Users,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: <BookOpen size={22} />,
    title: 'Plain-Language Summaries',
    description: 'Upload any legal document and get an instant, jargon-free explanation you can actually understand.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: <Shield size={22} />,
    title: 'Clause & Risk Detection',
    description: 'Color-coded analysis of obligations, risks, deadlines, and financial terms — with explanations for each.',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    icon: <GitCompare size={22} />,
    title: 'Document Comparison',
    description: 'Upload two versions of a contract and see exactly what changed, with AI analysis of which is more favorable.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'Document Q&A Chat',
    description: 'Ask specific questions about your document. Our AI answers only from the document content — never guesses.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: <Zap size={22} />,
    title: 'Action Checklist',
    description: 'Get a personalized checklist: what to verify, questions for your lawyer, and deadlines to track.',
    color: 'text-gold-400',
    bg: 'bg-gold-500/10 border-gold-500/20',
  },
  {
    icon: <Users size={22} />,
    title: 'Lawyer Prep Mode',
    description: 'Walk into your consultation prepared. Get a structured brief so you use every minute of billable time wisely.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
]

const stats = [
  { value: '6+', label: 'AI-Powered Features' },
  { value: 'WCAG AA', label: 'Accessibility Standard' },
  { value: '100%', label: 'Privacy-First' },
  { value: 'Ethical AI', label: 'Responsible Legal Tech' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-hero-gradient px-4 py-24 sm:py-32"
        aria-labelledby="hero-heading"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-gold-500/10 border border-gold-500/30 text-gold-300 text-sm font-medium mb-8"
          >
            <Sparkles size={14} aria-hidden="true" />
            Powered by Google Gemini AI
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Legal Documents,{' '}
            <span className="text-gradient">Made Simple</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            NyaySetu AI helps you understand rental agreements, employment contracts, and terms of service
            in plain language — so you walk into every legal situation informed and prepared.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/dashboard"
              className="btn-primary text-base px-8 py-4"
              aria-label="Upload a document to get started"
            >
              <Upload size={18} aria-hidden="true" />
              Upload a Document
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/comparison"
              className="btn-secondary text-base px-8 py-4"
              aria-label="Compare two legal documents"
            >
              <GitCompare size={18} aria-hidden="true" />
              Compare Documents
            </Link>
          </motion.div>

          {/* Disclaimer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-slate-500 mt-8"
          >
            ⚠️ NyaySetu AI provides informational assistance only. Not a substitute for legal advice.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface-card border-y border-surface-border py-12 px-4" aria-label="Platform highlights">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-display font-bold text-gradient mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="section-title mb-4">
              Everything You Need to Understand Any Legal Document
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              From rental agreements in Mumbai to employment contracts in Bengaluru —
              NyaySetu AI empowers you with context before you sign.
            </p>
          </div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`card border ${feature.bg} hover:scale-[1.02] transition-transform duration-200 cursor-default`}
                role="article"
              >
                <div className={`p-2.5 rounded-xl inline-flex mb-4 ${feature.bg}`}>
                  <span className={feature.color} aria-hidden="true">{feature.icon}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-card border-y border-surface-border py-24 px-4" aria-labelledby="how-it-works-heading">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="section-title mb-4">How It Works</h2>
            <p className="section-subtitle">Three steps to understanding any document</p>
          </div>
          <ol className="grid sm:grid-cols-3 gap-8" aria-label="Steps to use NyaySetu AI">
            {[
              { step: '01', title: 'Upload Your Document', desc: 'Drag and drop your PDF or DOCX. Your file is processed securely.' },
              { step: '02', title: 'Get AI Analysis', desc: 'Gemini AI summarizes, detects clauses, and flags risks in seconds.' },
              { step: '03', title: 'Ask & Prepare', desc: 'Chat with the document, download your checklist, and prep your lawyer brief.' },
            ].map(({ step, title, desc }) => (
              <li key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <span className="font-display font-bold text-navy-900 text-lg" aria-hidden="true">{step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 text-center" aria-labelledby="cta-heading">
        <div className="max-w-2xl mx-auto">
          <div className="p-3 bg-gold-500/10 rounded-full inline-flex mb-6">
            <Scale size={32} className="text-gold-400" aria-hidden="true" />
          </div>
          <h2 id="cta-heading" className="section-title mb-4">
            Start Understanding Your Documents Today
          </h2>
          <p className="section-subtitle mb-10">
            No subscription required for basic analysis. Upload your first document in seconds.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary text-base px-10 py-4"
            aria-label="Get started — upload your first document"
          >
            Get Started Free
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <p className="text-xs text-slate-500 mt-6">
            By using NyaySetu AI, you acknowledge that this service provides informational assistance only
            and does not constitute legal advice.
          </p>
        </div>
      </section>
    </div>
  )
}
