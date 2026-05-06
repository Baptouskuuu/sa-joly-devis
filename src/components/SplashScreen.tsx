import { useEffect, useState } from 'react'
import AnimatedShaderBackground from './ui/animated-shader-background'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), 2000)
    const doneTimer = window.setTimeout(() => onDone(), 2700)
    return () => { window.clearTimeout(fadeTimer); window.clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <AnimatedShaderBackground />

      {/* Overlay légèrement sombre pour améliorer la lisibilité du texte */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Texte centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`text-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <p
            className="text-white select-none"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.15em' }}
          >
            <span className="font-light opacity-75">devis.</span>
            <span className="font-bold tracking-widest">SA-JOLY</span>
          </p>
          <div
            className="mx-auto mt-3 h-px bg-white/30"
            style={{ width: 'clamp(120px, 20vw, 200px)', animation: 'float 3s ease-in-out infinite 0.3s' }}
          />
        </div>
      </div>
    </div>
  )
}
