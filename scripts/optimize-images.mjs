import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const outputDir = path.resolve('public/screenshots')

const screenshots = [
  [
    'hero-home',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.35-dfTEpeO6stC6hf9fXZD3I1iw5T0YEq.png'
  ],
  [
    'hero-workout',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.22-7QFrwEG5rKad37N3PwctIWtyqISpMm.png'
  ],
  [
    'hero-rest',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.01-DoDgnbT7KDBySSXcs47DntVhs9MfFQ.png'
  ],
  [
    'home-light',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.06.43-Vh3UqGd3XwpamZPhQ0ywJYWM53h30c.png'
  ],
  [
    'home-scheduled',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.09.10-OfZxfxrkvwHEgJdjmsRDoT0gH2UL8e.png'
  ],
  [
    'exercise-reps',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.07.57-BztysArEn24o79afNwHr13G0GUfP8w.png'
  ],
  [
    'exercise-timer',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.05-nv1sxPkIMHpnVJx5tM6tkGiMailAS5.png'
  ],
  [
    'editor',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.41-rJLAv5djJbjw5zZaRTJ1Me4CtVjKPN.png'
  ],
  [
    'exercise-picker',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.06.55-KBApjW9Xp4TQ1pyBwKRKn0FNYFBVvM.png'
  ],
  [
    'schedule',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.34-osPioyZ4ZoZStnGApUsYBzPMXw4EPi.png'
  ],
  [
    'done',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.15-Wg3NO4hidvYpvtYct9U4AeEk5cGJfM.png'
  ]
]

async function download(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function writeWebp(source, target, width, quality) {
  const buffer = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer()

  await writeFile(target, buffer)
}

await mkdir(outputDir, { recursive: true })

const logo = await readFile(path.resolve('public/logo.png'))
await writeWebp(logo, path.resolve('public/logo-160.webp'), 160, 74)
await writeWebp(logo, path.resolve('public/logo-320.webp'), 320, 78)

for (const [name, url] of screenshots) {
  const source = await download(url)
  await writeWebp(source, path.join(outputDir, `${name}-240.webp`), 240, 58)
  await writeWebp(source, path.join(outputDir, `${name}-400.webp`), 400, 62)
  await writeWebp(source, path.join(outputDir, `${name}-640.webp`), 640, 66)
}
