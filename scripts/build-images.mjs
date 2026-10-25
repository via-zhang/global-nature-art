// Turns the full-size images in art/ into web-sized WebP files in public/art/.
// Images are only resized, never cropped, so the whole canvas is always shown,
// and transparency is preserved so drawings sit on the current theme's background.
import { existsSync } from 'node:fs'
import { readdir, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'art'
const OUT = 'public/art'
const FULL_SIZE = 1400
const THUMB_SIZE = 256

// art/ is git-ignored, so it's missing on CI and fresh clones. The committed
// WebP files in public/art/ are used as-is there.
if (!existsSync(SRC)) {
  console.log(`images: no ${SRC}/ folder, using the committed files in ${OUT}/`)
  process.exit(0)
}

await mkdir(OUT, { recursive: true })

async function isFresh(src, out) {
  try {
    return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs
  } catch {
    return false
  }
}

const render = (file, size, quality) =>
  sharp(file)
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality, alphaQuality: 100 })

for (const file of await readdir(SRC)) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue
  const src = path.join(SRC, file)
  const name = path.parse(file).name
  const outputs = [[`${name}.webp`, FULL_SIZE, 82]]
  if (!name.endsWith('_sketch')) outputs.push([`${name}_thumb.webp`, THUMB_SIZE, 80])

  for (const [out, size, quality] of outputs) {
    const dest = path.join(OUT, out)
    if (await isFresh(src, dest)) continue
    await render(src, size, quality).toFile(dest)
    console.log(`images: ${out}`)
  }
}
