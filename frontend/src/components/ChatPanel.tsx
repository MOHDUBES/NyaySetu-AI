import { motion } from 'framer-motion'
import {
  AlertCircle,
  Bot,
  ChevronRight,
  Info,
  Loader2,
  Mic,
  MicOff,
  Send,
  Square,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { chatWithDocument } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  contentHi?: string
  isOutOfScope?: boolean
  sources?: string[]
  timestamp: Date
}

interface ChatPanelProps {
  documentId: string
  documentName?: string
  initialLanguage?: 'en' | 'hi'
}

/**
 * ChatPanel — Voice-first RAG document Q&A.
 * - Voice Input (Speech-to-Text) in Hindi and English via Web Speech API
 * - Voice Output (Text-to-Speech) with auto-read option for low-literacy users
 * - Bilingual Q&A with conversational Hinglish support
 * - Strict document scope guardrails and legal verdict disclaimers
 */
export default function ChatPanel({
  documentId,
  documentName = 'document',
  initialLanguage = 'hi',
}: ChatPanelProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(initialLanguage)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I can answer questions about "${documentName}" based on its content. You can type or tap the microphone to speak in English or Hindi. Remember: my answers are informational only, not legal advice.`,
      contentHi: `नमस्ते! मैं "${documentName}" के बारे में आपके सवालों के जवाब दे सकता हूँ। आप लिखकर पूछ सकते हैं या माइक बटन दबाकर हिंदी या इंग्लिश में बोल सकते हैं। ध्यान रहे: यह केवल सूचना के लिए है, कानूनी सलाह नहीं।`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Voice State
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('')
        setInput(transcript)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error !== 'no-speech') {
          setError(`Voice input notice: ${event.error}. Please try again or type.`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
      }

      recognitionRef.current = recognition
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [language])

  const toggleListening = () => {
    if (!speechSupported) {
      setError('Voice recognition is not supported in this browser. Please use Chrome/Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      inputRef.current?.focus()
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
          recognitionRef.current.start()
        }
      } catch (err) {
        console.error('Mic start error:', err)
      }
    }
  }

  const speakText = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel()
        setSpeakingId(null)
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      utterance.rate = 0.95
      utterance.pitch = 1.0

      utterance.onstart = () => setSpeakingId(id)
      utterance.onend = () => setSpeakingId(null)
      utterance.onerror = () => setSpeakingId(null)

      window.speechSynthesis.speak(utterance)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (customText?: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
      setIsListening(false)
    }

    const question = (customText || input).trim()
    if (!question || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await chatWithDocument(documentId, question, history, language)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        contentHi: response.answer_hi,
        isOutOfScope: response.is_out_of_scope,
        sources: response.sources,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Auto-speak if enabled for accessibility
      if (autoSpeak) {
        const textToSpeak =
          language === 'hi' && response.answer_hi ? response.answer_hi : response.answer
        speakText(textToSpeak, assistantMessage.id)
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = language === 'hi'
    ? [
        'मेरे मुख्य दायित्व (obligations) क्या हैं?',
        'क्या कोई पेनल्टी या लेट फीस है?',
        'यह एग्रीमेंट कब समाप्त होगा?',
        'सिक्योरिटी डिपॉजिट के क्या नियम हैं?',
      ]
    : [
        'What are my main obligations?',
        'Are there any termination clauses?',
        'What penalties are mentioned?',
        'What are the payment terms?',
      ]

  return (
    <section
      className="flex flex-col h-[640px] bg-surface-card rounded-2xl border border-surface-border overflow-hidden shadow-xl"
      aria-label="Voice-First Document Q&A"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-border flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gold-500/20 rounded-xl text-gold-400">
            <Bot size={18} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Voice & Text Legal Q&A</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STT / TTS Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'माइक दबाकर सवाल पूछें या लिखकर भेजें' : 'Speak via mic or type questions'}
            </p>
          </div>
        </div>

        {/* Controls: Language toggle + Auto-speak toggle */}
        <div className="flex items-center gap-2">
          {/* Auto-speak toggle */}
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoSpeak
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
            }`}
            title="Automatically read AI responses aloud"
            aria-pressed={autoSpeak}
          >
            {autoSpeak ? <Volume2 size={14} className="text-gold-400" /> : <VolumeX size={14} />}
            <span>{language === 'hi' ? 'ऑटो-वॉइस' : 'Auto-Speak'}</span>
          </button>

          {/* Language toggle */}
          <div
            className="flex items-center p-0.5 bg-surface rounded-lg border border-surface-border"
            role="group"
            aria-label="Voice & Chat Language"
          >
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                language === 'hi'
                  ? 'bg-gold-500 text-surface-bg font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={language === 'hi'}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded text-xs transition-all ${
                language === 'en'
                  ? 'bg-gold-500 text-surface-bg font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {/* Suggested questions (shown only initially) */}
        {messages.length === 1 && (
          <div className="space-y-2 mb-4 p-3 rounded-xl bg-gold-500/5 border border-gold-500/10">
            <p className="text-xs text-gold-400 font-medium">
              {language === 'hi' ? 'सुझाए गए सवाल (क्लिक करें):' : 'Suggested questions (click to ask):'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="flex items-center gap-2 text-left p-2 rounded-lg
                             bg-surface hover:bg-white/5 text-xs text-slate-300 hover:text-white
                             border border-surface-border transition-all"
                  aria-label={`Ask: ${q}`}
                >
                  <ChevronRight size={12} className="text-gold-400 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const displayContent =
            language === 'hi' && message.contentHi ? message.contentHi : message.content

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              role="article"
              aria-label={`${message.role === 'user' ? 'Your message' : 'AI response'}: ${displayContent.slice(0, 60)}...`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${message.role === 'user' ? 'bg-gold-500/20' : 'bg-slate-700'}`}
                aria-hidden="true"
              >
                {message.role === 'user'
                  ? <User size={15} className="text-gold-400" />
                  : <Bot size={15} className="text-slate-300" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm
                    ${message.role === 'user'
                      ? 'bg-gold-500/15 text-white rounded-tr-sm border border-gold-500/30'
                      : 'bg-surface text-slate-200 rounded-tl-sm border border-surface-border'
                    }`}
                >
                  {displayContent}
                </div>

                {/* Out of scope warning */}
                {message.isOutOfScope && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <Info size={13} className="text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-xs text-amber-300">
                      {language === 'hi'
                        ? 'यह प्रश्न दस्तावेज़ के दायरे से बाहर हो सकता है। कृपया किसी वकील से परामर्श लें।'
                        : 'This question may be outside document scope. Consider consulting a legal professional.'}
                    </p>
                  </div>
                )}

                {/* Disclaimer on AI responses + Audio read aloud */}
                {message.role === 'assistant' && message.id !== 'welcome' && (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-500 italic">
                      {language === 'hi' ? 'केवल सूचनात्मक — कानूनी सलाह नहीं' : 'Informational only — not legal advice'}
                    </p>
                    {'speechSynthesis' in window && (
                      <button
                        onClick={() => speakText(displayContent, message.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          speakingId === message.id
                            ? 'text-gold-400 bg-gold-500/20 animate-pulse'
                            : 'text-slate-400 hover:text-gold-400'
                        }`}
                        aria-label={speakingId === message.id ? 'Stop speech' : 'Listen aloud'}
                        title={speakingId === message.id ? 'Stop listening' : 'Listen with Voice TTS'}
                      >
                        {speakingId === message.id ? <Square size={13} /> : <Volume2 size={13} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3" aria-live="polite" aria-label="AI is thinking">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <Bot size={15} className="text-slate-300" aria-hidden="true" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface flex items-center gap-2 border border-surface-border">
              <Loader2 size={14} className="text-gold-400 animate-spin" aria-hidden="true" />
              <span className="text-xs text-slate-400">
                {language === 'hi' ? 'दस्तावेज़ का विश्लेषण हो रहा है...' : 'Analyzing document with Gemini AI...'}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Voice Status Banner (when listening) */}
      {isListening && (
        <div
          className="px-4 py-2 bg-gold-500/15 border-t border-gold-500/30 flex items-center justify-between animate-pulse"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-gold-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>
              {language === 'hi'
                ? 'माइक सुन रहा है... हिंदी या इंग्लिश में बोलें'
                : 'Listening... Speak your question now'}
            </span>
          </div>
          <button
            onClick={toggleListening}
            className="text-xs text-gold-400 hover:text-white underline font-medium"
          >
            {language === 'hi' ? 'रोकें (Stop)' : 'Stop'}
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-surface-border bg-surface/40">
        <div className="flex gap-2 items-end">
          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-all shrink-0 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-gold-500/20 text-gold-400 hover:bg-gold-500 hover:text-surface-bg border border-gold-500/30'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start speaking question'}
            title={
              speechSupported
                ? language === 'hi'
                  ? 'माइक से बोलें (Voice input in Hindi/English)'
                  : 'Speak your question (Voice input)'
                : 'Speech recognition not supported in this browser'
            }
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'hi'
                ? 'माइक दबाकर बोलें या यहाँ लिखें... (Enter दबाएं)'
                : 'Ask a question or tap mic to speak... (Enter to send)'
            }
            rows={2}
            className="input resize-none flex-1 text-sm bg-surface"
            aria-label="Chat message input"
            aria-describedby="chat-hint"
            disabled={isLoading}
            maxLength={2000}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="btn-primary py-3 px-4 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading
              ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              : <Send size={16} aria-hidden="true" />
            }
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
          <span>
            {language === 'hi'
              ? 'Enter: भेजें · Shift+Enter: नई लाइन · माइक: बोलकर पूछें'
              : 'Press Enter to send · Tap mic for voice'}
          </span>
          <span>{input.length}/2000</span>
        </div>
      </div>
    </section>
  )
}
