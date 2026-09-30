import { mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'public', 'icons')

const favicon = await readFile(join(root, 'public', 'favicon.svg'))
const maskable = await readFile(join(iconsDir, 'icon-maskable.svg'))

await mkdir(iconsDir, { recursive: true })

async function png(svg, size, file) {
  await sharp(svg).resize(size, size).png().toFile(file)
}

await png(favicon, 192, join(iconsDir, 'icon-192.png'))
await png(favicon, 512, join(iconsDir, 'icon-512.png'))
await png(favicon, 180, join(root, 'public', 'apple-touch-icon.png'))
await png(maskable, 192, join(iconsDir, 'icon-maskable-192.png'))
await png(maskable, 512, join(iconsDir, 'icon-maskable-512.png'))
