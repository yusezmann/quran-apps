/**
 * Membuat file suara huruf hijaiyah untuk fitur "Belajar" memakai Google Cloud Text-to-Speech.
 * Dijalankan SEKALI di laptop (bukan di aplikasi) agar API key tidak ikut tertanam di APK.
 *
 * Pemakaian:
 *   1. Isi GOOGLE_TTS_API_KEY di file .env.local (tidak ikut git)
 *   2. npm run belajar:audio                 → buat semua file yang belum ada
 *      npm run belajar:audio -- --force      → buat ulang semua
 *      npm run belajar:audio -- --only=ha,ain → buat ulang huruf tertentu
 *      npm run belajar:audio -- --voice=ar-XA-Wavenet-A   → coba suara lain
 *
 * Hasil: public/assets/belajar/audio/<id>.mp3 (nama huruf) & <id>-fathah.mp3 (huruf berfathah),
 * lalu lib/belajar/recorded-audio.json diperbarui sehingga aplikasi otomatis memakainya.
 * File yang Anda ganti dengan rekaman sendiri tidak ditimpa kecuali memakai --force/--only.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs"
import { join } from "node:path"
import { LESSONS, LETTERS, joinSyllables, pairAudioId, syllablePairs, withFathah } from "../lib/belajar/letters.ts"

const ROOT = process.cwd()
const OUT_DIR = join(ROOT, "public/assets/belajar/audio")
const MANIFEST = join(ROOT, "lib/belajar/recorded-audio.json")

function readEnvKey(): string {
  if (process.env.GOOGLE_TTS_API_KEY) return process.env.GOOGLE_TTS_API_KEY
  for (const file of [".env.local", ".env"]) {
    const path = join(ROOT, file)
    if (!existsSync(path)) continue
    const line = readFileSync(path, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("GOOGLE_TTS_API_KEY="))
    if (line) return line.slice("GOOGLE_TTS_API_KEY=".length).trim().replace(/^["']|["']$/g, "")
  }
  throw new Error("GOOGLE_TTS_API_KEY tidak ditemukan. Isi di file .env.local")
}

const args = process.argv.slice(2)
const force = args.includes("--force")
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",")
// Suara WaveNet perempuan, jelas & lembut untuk anak (kuota gratis 1 juta karakter/bulan)
const voice = args.find((a) => a.startsWith("--voice="))?.slice(8) ?? "ar-XA-Wavenet-D"

/**
 * Pengecualian suara per file, hasil uji dengar (suara D terdengar seperti "ha" untuk أَ).
 * Tidak berlaku bila --voice diisi.
 */
const VOICE_OVERRIDES: Record<string, string> = {
  "alif-fathah": "ar-XA-Wavenet-A",
}

async function synthesize(key: string, text: string, voiceName = voice): Promise<Buffer> {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "ar-XA", name: voiceName },
      audioConfig: { audioEncoding: "MP3", speakingRate: 0.8, sampleRateHertz: 24000 },
    }),
  })
  if (!res.ok) throw new Error(`Google TTS ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const { audioContent } = (await res.json()) as { audioContent: string }
  return Buffer.from(audioContent, "base64")
}

async function main() {
  const key = readEnvKey()
  mkdirSync(OUT_DIR, { recursive: true })

  const jobs = LETTERS.flatMap((l) => [
    { id: l.id, text: l.nameAr, label: `${l.latin} (nama huruf)` },
    { id: `${l.id}-fathah`, text: withFathah(l), label: `${l.fathahLatin} (fathah)` },
  ])
    // Latihan "Sambung": semua pasangan yang muncul di 7 pelajaran
    .concat(
      LESSONS.flatMap((lesson) =>
        syllablePairs(lesson.index).map((pair) => ({
          id: pairAudioId(pair),
          text: joinSyllables(pair),
          label: `${pair.map((l) => l.fathahLatin).join("-")} (sambung)`,
        })),
      ),
    )
    .filter((j, i, all) => all.findIndex((x) => x.id === j.id) === i)
    .filter((j) => !only || only.includes(j.id.replace(/-fathah$/, "")))

  let made = 0
  for (const job of jobs) {
    const file = join(OUT_DIR, `${job.id}.mp3`)
    if (existsSync(file) && !force && !only) continue
    process.stdout.write(`• ${job.label.padEnd(22)} ${job.text}  → ${job.id}.mp3 ... `)
    const customVoice = args.some((a) => a.startsWith("--voice=")) ? voice : VOICE_OVERRIDES[job.id] ?? voice
    writeFileSync(file, await synthesize(key, job.text, customVoice))
    made++
    console.log("ok")
  }

  // Hapus file "sambung" lama yang tidak lagi dipakai pelajaran mana pun
  const wanted = new Set(jobs.map((j) => j.id))
  if (!only) {
    for (const f of readdirSync(OUT_DIR)) {
      const id = f.slice(0, -4)
      if (f.startsWith("sambung-") && f.endsWith(".mp3") && !wanted.has(id)) unlinkSync(join(OUT_DIR, f))
    }
  }

  // Manifest: semua file mp3 yang ada (hasil TTS maupun rekaman sendiri)
  const ids = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".mp3"))
    .map((f) => f.slice(0, -4))
    .sort()
  writeFileSync(MANIFEST, JSON.stringify(ids, null, 2) + "\n")
  console.log(`\nSelesai: ${made} file dibuat, ${ids.length} file terdaftar di lib/belajar/recorded-audio.json (suara: ${voice})`)
}

main().catch((e) => {
  console.error("\nGagal:", e.message)
  process.exit(1)
})
