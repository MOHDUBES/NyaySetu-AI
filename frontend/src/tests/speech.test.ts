import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  findVoiceForLanguage,
  speakUtterance,
  stopSpeaking,
} from '../lib/speech'

describe('speech utility', () => {
  const mockVoices = [
    { name: 'Microsoft Swara Online (Natural) - Hindi (India)', lang: 'hi-IN' },
    { name: 'Google हिन्दी', lang: 'hi' },
    { name: 'Microsoft Neerja Online (Natural) - English (India)', lang: 'en-IN' },
    { name: 'Google US English', lang: 'en-US' },
  ] as unknown as SpeechSynthesisVoice[]

  const mockSpeak = vi.fn()
  const mockCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Global mock for SpeechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        getVoices: vi.fn(() => mockVoices),
        speak: mockSpeak,
        cancel: mockCancel,
        onvoiceschanged: null,
      },
    })

    // Global mock for SpeechSynthesisUtterance
    class MockUtterance {
      text: string
      lang = 'en-US'
      rate = 1
      pitch = 1
      voice: SpeechSynthesisVoice | null = null
      onstart: (() => void) | null = null
      onend: (() => void) | null = null
      onerror: ((err: unknown) => void) | null = null
      constructor(text: string) {
        this.text = text
      }
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      value: MockUtterance,
    })
  })

  it('finds Hindi voice correctly when requested', () => {
    const voice = findVoiceForLanguage('hi')
    expect(voice).toBeDefined()
    expect(voice?.lang).toMatch(/hi/i)
  })

  it('finds Indian English voice when en or en-IN is requested', () => {
    const voice = findVoiceForLanguage('en-IN')
    expect(voice).toBeDefined()
    expect(voice?.lang).toBe('en-IN')
  })

  it('auto-detects Hindi text with Devanagari script and assigns hi-IN', () => {
    const utterance = speakUtterance('यह दस्तावेज़ कानूनी सलाह नहीं है।')
    expect(utterance).not.toBeNull()
    expect(utterance?.lang).toBe('hi-IN')
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  it('assigns en-IN for English text', () => {
    const utterance = speakUtterance('This clause requires 30 days prior notice.')
    expect(utterance).not.toBeNull()
    expect(utterance?.lang).toBe('en-IN')
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  it('cancels active speech when stopSpeaking is invoked', () => {
    stopSpeaking()
    expect(mockCancel).toHaveBeenCalled()
  })

  it('returns null when empty or markdown-only text is passed', () => {
    const utterance = speakUtterance('   ***   ')
    expect(utterance).toBeNull()
    expect(mockSpeak).not.toHaveBeenCalled()
  })
})
