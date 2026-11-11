"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Globe } from "lucide-react"

// TODO: ganti dengan nama lengkap Anda jika ingin ditampilkan
const AUTHOR = "yusezmann"
const PORTFOLIO_URL = "https://usman-nine.vercel.app/"
const REPO_URL = "https://github.com/yusezmann/quran-apps"

export function Footer() {
  return (
    <footer className="bg-[#010511] text-gray-400 py-6 border-t border-gray-800 px-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
        {/* Logo & Nama */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold hover:text-green-300"
        >
          <Image
            src="/assets/logo/logo.png"
            alt="Logo Al Quran"
            width={40}
            height={40}
          />
          <span className="text-lg md:text-xl text-white">Al Quran</span>
        </Link>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-sm">
          <p>
            © {new Date().getFullYear()} Dibuat oleh{" "}
            <span className="text-gray-200 font-medium">{AUTHOR}</span>
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-300 hover:text-green-200 transition-colors"
            >
              <Globe className="h-4 w-4" /> Portofolio
            </Link>
            <Link
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-300 hover:text-green-200 transition-colors"
            >
              <Github className="h-4 w-4" /> Kode Sumber
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
