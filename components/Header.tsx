"use client"

import Link from "next/link"
import { LoginOutlined, MenuOutlined } from "@ant-design/icons"
import { Button } from "antd"
import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import MobileMenu from "./mobile-menu"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-green-600" : "bg-transparent"
      }`}
    >
      <div className="px-4 md:px-16 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex text-2xl font-bold items-center gap-2 hover:text-accent-hover"
        >
          <Image
            src="/assets/logo/logo.png"
            alt="logo"
            width={50}
            height={50}
          />
          <h2 className="text-white">Al Quran</h2>
        </Link>
        <div className="hidden xl:flex gap-6">
          {["/", "/imsakiyah", "/doa", "/asmaulhusna"].map((path, idx) => (
            <Link
              key={path}
              href={path}
              className={
                pathname === path
                  ? "text-green-300 font-bold border-b-2 border-green-300"
                  : "hover:text-accent-hover"
              }
            >
              {["Home", "Imsakiyah", "Doa", "Asmaul Husna"][idx]}
            </Link>
          ))}
        </div>
        <div className="xl:hidden">
          <Button
            type="default"
            shape="circle"
            icon={
              <MenuOutlined className="text-white/60 hover:text-accent-hover" />
            }
            className="bg-transparent border-white/60 hover:border-accent-hover"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
      </div>
      <MobileMenu
        isOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
    </nav>
  )
}
