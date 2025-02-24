"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#010511] text-gray-400 py-6 border-t border-gray-700 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        {/* Logo & Nama */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold hover:text-green-300 mb-4 md:mb-0"
        >
          <Image
            src="/assets/logo/logo.png"
            alt="Logo Al Quran"
            width={40}
            height={40}
            priority
          />
          <h2 className="text-lg md:text-xl text-white">Al Quran</h2>
        </Link>

        {/* Hak Cipta */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Made with ❤️ by{" "}
          <a
            href="https://github.com/yusezmann/quran-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 hover:text-green-400 transition-colors"
          >
            Me
          </a>
        </p>
      </div>
    </footer>
  )
}
