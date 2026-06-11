import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Jimp from 'jimp'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ITEMS = [
  {
    filename: 'furniture-sofa',
    prompt:
      'a modern luxury three-seater sofa levitating in mid-air, tilted at an angle with the left side higher than the right, ' +
      'floating and rotating slightly, cream boucle fabric upholstery, gold metal legs, ' +
      'dramatic 3/4 perspective from slightly above, sofa suspended in white void, ' +
      'pure white background, no floor no ground no surface no shadow beneath it, ' +
      'object floating in space, anti-gravity furniture, studio lighting, ultra photorealistic product render',
  },
  {
    filename: 'furniture-table',
    prompt:
      'a sleek modern coffee table levitating in mid-air, tilted at an angle with the right side higher than the left, ' +
      'floating and rotating slightly, solid walnut wood top with slim brushed brass legs, ' +
      'dramatic 3/4 perspective from slightly above, table suspended in white void, ' +
      'pure white background, no floor no ground no surface no shadow beneath it, ' +
      'object floating in space, anti-gravity furniture, studio lighting, ultra photorealistic product render',
  },
  {
    filename: 'furniture-chair',
    prompt:
      'a stylish designer accent chair levitating in mid-air, tilted at an angle with the left side higher than the right, ' +
      'floating and rotating slightly, sage green velvet seat, black powder-coated metal frame, ' +
      'dramatic 3/4 perspective from slightly above, chair suspended in white void, ' +
      'pure white background, no floor no ground no surface no shadow beneath it, ' +
      'object floating in space, anti-gravity furniture, studio lighting, ultra photorealistic product render',
  },
]

const outputDir = join(__dirname, '..', 'frontend', 'public', 'furniture')
mkdirSync(outputDir, { recursive: true })

async function downloadImage(prompt, seed) {
  const encoded = encodeURIComponent(prompt)
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true&enhance=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pollinations ${res.status}: ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

// Flood-fill from image edges to find and remove the background.
// Works well for product photos with white/near-white backgrounds.
async function removeBackground(jpgBuffer) {
  const img = await Jimp.read(jpgBuffer)
  const w = img.getWidth()
  const h = img.getHeight()

  // Threshold: a pixel is "background" if it's near-white
  const isBg = (x, y) => {
    const hex = img.getPixelColor(x, y)
    const { r, g, b } = Jimp.intToRGBA(hex)
    return r > 228 && g > 226 && b > 220
  }

  const marked = new Uint8Array(w * h) // 1 = background
  const stack = []

  const push = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return
    if (marked[y * w + x]) return
    if (!isBg(x, y)) return
    marked[y * w + x] = 1
    stack.push(x, y)
  }

  // Seed from all four edges
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }

  while (stack.length) {
    const y = stack.pop()
    const x = stack.pop()
    push(x + 1, y); push(x - 1, y)
    push(x, y + 1); push(x, y - 1)
  }

  // Apply transparency to marked pixels + soft feather at boundary
  img.scan(0, 0, w, h, function (x, y, idx) {
    if (!marked[y * w + x]) return
    // Check if any neighbor is NOT background (boundary pixel → semi-transparent)
    const atEdge =
      (x > 0 && !marked[y * w + x - 1]) ||
      (x < w - 1 && !marked[y * w + x + 1]) ||
      (y > 0 && !marked[(y - 1) * w + x]) ||
      (y < h - 1 && !marked[(y + 1) * w + x])
    this.bitmap.data[idx + 3] = atEdge ? 80 : 0
  })

  return img.getBufferAsync(Jimp.MIME_PNG)
}

for (let i = 0; i < ITEMS.length; i++) {
  const item = ITEMS[i]
  process.stdout.write(`[${i + 1}/3] Generating ${item.filename} ... `)
  try {
    const jpgBuf = await downloadImage(item.prompt, 100 + i)
    process.stdout.write('removing background ... ')
    const pngBuf = await removeBackground(jpgBuf)
    const outPath = join(outputDir, `${item.filename}.png`)
    writeFileSync(outPath, pngBuf)
    console.log(`saved (${(pngBuf.length / 1024).toFixed(0)} KB)`)
  } catch (err) {
    console.error(`FAILED: ${err.message}`)
  }
}

console.log('\nAll done. Images saved to frontend/public/furniture/')
