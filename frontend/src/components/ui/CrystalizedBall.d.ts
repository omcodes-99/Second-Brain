import type { CSSProperties, ReactElement } from 'react'

type CrystalizedBallPreset = 'plasma' | 'aurora' | 'nebula' | 'ember' | 'frost' | 'solar' | 'eclipse' | 'abyss'
type CrystalizedBallMotion = 'rise' | 'fall' | 'drift' | 'orbit'

interface CrystalizedBallProps {
  preset?: CrystalizedBallPreset
  color?: string
  theme?: 'dark' | 'light'
  size?: number
  strands?: number
  crackle?: number
  flares?: number
  glow?: number
  sparks?: number
  particleCount?: number
  fill?: number
  motion?: CrystalizedBallMotion
  particleShape?: 'square' | 'round'
  depth?: number
  sway?: number
  twinkle?: number
  haze?: number
  speed?: number
  dustSpeed?: number
  interactive?: boolean
  hoverStrength?: number
  intro?: boolean
  paused?: boolean
  className?: string
  style?: CSSProperties
}

export default function CrystalizedBall(props: CrystalizedBallProps): ReactElement
