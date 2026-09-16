/**
 * NyaySetu AI — Voice Speech Synthesis (TTS) Helper
 * Provides robust voice selection with automatic Hindi (hi-IN) and English (en-IN/en-US)
 * voice resolution in modern browsers (Chromium, Edge, Safari, Firefox).
 */

let cachedVoices: SpeechSynthesisVoice[] = []

function updateVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices()
    if (list && list.length > 0) {
      cachedVoices = list
    }
  }
}

// Initial fetch and listener for async voice loading in browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  updateVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    updateVoices()
  }
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  updateVoices()
  return cachedVoices
}

/**
 * Finds the most natural and appropriate voice for the requested language.
 * Prefers Hindi voices (Google हिन्दी, Microsoft Swara/Madhur/Kalpana, hi-IN) when lang is 'hi' or 'hi-IN'.
 * Prefers Indian English (en-IN, Neerja, Prabhat) or standard English when lang is 'en' or 'en-IN'.
 */
export function findVoiceForLanguage(lang: 'hi' | 'en' | 'hi-IN' | 'en-IN'): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices()
  if (voices.length === 0) return null

  const isHindi = lang.toLowerCase().startsWith('hi')

  if (isHindi) {
    // 1. High priority: Exact hi-IN match or online natural voices
    const exactHindi = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-')
      return l === 'hi-in' || l === 'hi'
    })
    if (exactHindi) return exactHindi

    // 2. Name contains Hindi or known Hindi voice names
    const namedHindi = voices.find((v) => {
      const name = v.name.toLowerCase()
      return (
        name.includes('hindi') ||
        name.includes('हिन्दी') ||
        name.includes('swara') ||
        name.includes('madhur') ||
        name.includes('kalpana') ||
        name.includes('hemant')
      )
    })
    if (namedHindi) return namedHindi
  } else {
    // 1. Indian English preference for natural familiar accent
    const enInVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-')
      const n = v.name.toLowerCase()
      return l === 'en-in' || (l.startsWith('en') && (n.includes('india') || n.includes('neerja') || n.includes('prabhat')))
    })
    if (enInVoice) return enInVoice

    // 2. Any English voice
    const generalEnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'))
    if (generalEnVoice) return generalEnVoice
  }

  return null
}

export interface SpeakOptions {
  lang?: 'hi' | 'en' | 'hi-IN' | 'en-IN'
  rate?: number
  pitch?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: unknown) => void
}

/**
 * Speak text aloud with proper language and voice assignment.
 */
export function speakUtterance(text: string, options: SpeakOptions = {}): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  // Always cancel any ongoing speech to prevent overlapping voices
  window.speechSynthesis.cancel()

  const cleanText = text.replace(/[*#_`~[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleanText) return null

  const utterance = new SpeechSynthesisUtterance(cleanText)

  // Determine target language code
  let targetLang: 'hi-IN' | 'en-IN' = 'en-IN'
  if (options.lang === 'hi' || options.lang === 'hi-IN') {
    targetLang = 'hi-IN'
  } else if (options.lang === 'en' || options.lang === 'en-IN') {
    targetLang = 'en-IN'
  } else {
    // Auto-detect Devanagari Hindi characters
    const hasHindiChar = /[\u0900-\u097F]/.test(cleanText)
    targetLang = hasHindiChar ? 'hi-IN' : 'en-IN'
  }

  utterance.lang = targetLang
  utterance.rate = options.rate ?? (targetLang === 'hi-IN' ? 0.90 : 0.95)
  utterance.pitch = options.pitch ?? 1.0

  // Explicitly assign the matched native or online voice
  const matchedVoice = findVoiceForLanguage(targetLang)
  if (matchedVoice) {
    utterance.voice = matchedVoice
  }

  if (options.onStart) utterance.onstart = options.onStart
  if (options.onEnd) utterance.onend = options.onEnd
  if (options.onError) utterance.onerror = options.onError

  window.speechSynthesis.speak(utterance)
  return utterance
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
