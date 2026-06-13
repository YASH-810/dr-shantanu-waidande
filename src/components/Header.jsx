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

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  const navLinks = ['Home', 'About', 'Services', 'Contact']

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:pointer-events-none ${
        scrolled || menuOpen ? 'bg-background/95 backdrop-blur-md border-b border-muted shadow-sm md:bg-transparent md:border-none md:shadow-none md:backdrop-blur-none' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 md:px-0 h-16 md:h-auto md:pt-5 flex items-center justify-between md:justify-center md:pointer-events-none">
          
          {/* Mobile Logo */}
          <div className="md:hidden font-extrabold text-xl text-foreground tracking-tight pointer-events-auto">
            Dr. Shantanu
          </div>

          {/* Desktop Pill Nav */}
          <nav
            className={`hidden md:inline-flex pointer-events-auto items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-background/95 backdrop-blur-md border border-muted shadow-lg shadow-primary/5'
                : 'bg-background/70 backdrop-blur-sm border border-muted/50'
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-foreground/80 hover:text-primary text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 hover:bg-muted/65 no-underline whitespace-nowrap"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-md transition-colors pointer-events-auto z-50 relative"
          >
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[260px] bg-background border-l border-muted/50 z-40 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] md:hidden flex flex-col pt-20 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ul className="list-none m-0 p-4 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block text-foreground hover:text-primary hover:bg-primary/5 text-base font-semibold px-4 py-3 rounded-xl transition-all no-underline"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Header