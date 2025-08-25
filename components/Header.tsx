"use client"

import Link from "next/link"
import { LoginOutlined, MenuOutlined } from "@ant-design/icons"
import { Button } from "antd"
import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import MobileMenu from "./mobile-menu"
import Nav from "./Nav"

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav
      className={`fixed w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-green-600" : "bg-transparent"
      }`}
    >
      <div className="px-4 md:px-16 py-6 flex items-center justify-between">
        {/* Logo - Hidden on mobile */}
        <div className="hidden xl:block">
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
        </div>

        {/* Mobile Logo */}
        <div className="xl:hidden">
          <Link
            href="/"
            className="flex text-xl font-bold items-center gap-2"
          >
            <Image
              src="/assets/logo/logo.png"
              alt="logo"
              width={40}
              height={40}
            />
            <h2 className="text-white">Al Quran</h2>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex gap-6">
          {["/", "/imsakiyah", "/doa", "/asmaulhusna", "/hadits"].map(
            (path, idx) => (
              <Link
                key={path}
                href={path}
                className={
                  pathname === path
                    ? "text-green-300 font-bold border-b-2 border-green-300"
                    : "hover:text-accent-hover"
                }
              >
                {["Home", "Imsakiyah", "Doa", "Asmaul Husna", "Hadits"][idx]}
              </Link>
            ),
          )}
        </div>

        {/* Mobile Menu Button */}
        {/* <div className="sm:hidden">
          <Button
            type="default"
            shape="circle"
            icon={
              <MenuOutlined className="text-white/80 hover:text-white transition-colors duration-200" />
            }
            className="bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div> */}
      </div>

      {/* Mobile Menu */}
      {/* <MobileMenu
        isOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      /> */}
      
      {/* Desktop Navigation Bar */}
      <div className="sm:hidden">
        <Nav />
      </div>
    </nav>
  )
}
