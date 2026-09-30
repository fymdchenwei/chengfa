import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'public', 'icons')

function starPoints(cx, cy, outer, inner) {
  const points = []
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`)
  }
  return points.join(' ')
}

function iconSvg({ maskable }) {
  const background = maskable
    ? '<rect width="512" height="512" fill="#FF8A3D"/>'
    : '<rect width="512" height="512" rx="112" fill="#FF8A3D"/>'
  const circle = maskable
    ? '<circle cx="256" cy="256" r="148" fill="#FFF6EA"/>'
    : '<circle cx="256" cy="250" r="168" fill="#FFF6EA"/>'
  const cross = maskable
    ? `<path d="M190 190 L322 322" stroke="#FF8A3D" stroke-width="36" stroke-linecap="round"/>
       <path d="M322 190 L190 322" stroke="#FF8A3D" stroke-width="36" stroke-linecap="round"/>`
    : `<path d="M176 176 L336 336" stroke="#FF8A3D" stroke-width="42" stroke-linecap="round"/>
       <path d="M336 176 L176 336" stroke="#FF8A3D" stroke-width="42" stroke-linecap="round"/>`
  const badge = maskable
    ? ''
    : `<circle cx="392" cy="116" r="48" fill="#FFC857"/>
       <polygon points="${starPoints(392, 116, 22, 10)}" fill="#FFF6EA"/>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${background}
  ${circle}
  ${cross}
  ${badge}
</svg>`
}

const favicon = iconSvg({ maskable: false })

await mkdir(iconsDir, { recursive: true })
await writeFile(join(root, 'public', 'favicon.svg'), favicon)

async function png(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file)
}

await png(favicon, 192, join(iconsDir, 'icon-192.png'))
await png(favicon, 512, join(iconsDir, 'icon-512.png'))
await png(favicon, 180, join(root, 'public', 'apple-touch-icon.png'))
await png(iconSvg({ maskable: true }), 512, join(iconsDir, 'icon-maskable-512.png'))
