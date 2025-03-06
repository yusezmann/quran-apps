"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#010511] text-gray-400 py-6 border-t border-gray-700 px-4">
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
            priority
          />
          <h2 className="text-lg md:text-xl text-white">Al Quran</h2>
        </Link>

        {/* Hak Cipta */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Made with{" "}
          <span className="text-red-500">❤️</span> by{" "}
          <Link
            href="https://usman-nine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 hover:text-green-400 transition-colors"
          >
            Me
          </Link>
        </p>
      </div>
    </footer>
  )
}
