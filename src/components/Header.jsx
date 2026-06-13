"use client"
import React, { useState, useEffect } from 'react'

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = ['Home', 'About', 'Services', 'Contact']

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4 pointer-events-none">

      {/* Pill — only as wide as its content */}
      <nav
        className={`pointer-events-auto inline-flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border border-muted shadow-lg shadow-primary/5'
            : 'bg-background/70 backdrop-blur-sm border border-muted/50'
        }`}
      >
        {/* Desktop Links */}
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="hidden md:block text-foreground/80 hover:text-primary text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 hover:bg-muted/65 no-underline whitespace-nowrap"
          >
            {link}
          </a>
        ))}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-full hover:bg-muted/65 transition-colors"
        >
          <span className={`block w-5 h-0.5 bg-foreground transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-foreground transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="pointer-events-auto absolute top-[70px] bg-background border border-muted rounded-2xl shadow-xl overflow-hidden">
          <ul className="list-none m-0 p-2 flex flex-col gap-1 min-w-[160px]">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="block text-foreground/80 hover:text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-muted/50 transition-all no-underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header