import '@testing-library/jest-dom'

// Global mock for SpeechSynthesisUtterance in jsdom
if (typeof window !== 'undefined') {
  if (!window.SpeechSynthesisUtterance) {
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
    // @ts-expect-error Mocking browser global
    window.SpeechSynthesisUtterance = MockUtterance
  }

  if (!window.speechSynthesis) {
    // @ts-expect-error Mocking browser global
    window.speechSynthesis = {
      getVoices: () => [],
      speak: () => {},
      cancel: () => {},
      onvoiceschanged: null,
    }
  }
}

