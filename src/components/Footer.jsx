"use client"
import React from 'react'

const Footer = () => {
  return (
    <footer className="relative bg-foreground text-background pt-20  overflow-hidden">
      
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
        
        {/* Brand & Description */}
        <div className="md:col-span-2">
          <h3 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Dr. Shantanu<span className="text-primary">.</span>
          </h3>
          <p className="text-muted/80 text-base leading-relaxed max-w-sm mb-8">
            Expert physiotherapy care delivered to your doorstep. We specialize in fast recovery, customized treatment plans, and long-term pain relief.
          </p>
          
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {['Home', 'About', 'Services', 'Contact'].map((link) => (
              <li key={link}>
                <a 
                  href={`#${link.toLowerCase()}`}
                  className="text-muted/70 hover:text-primary transition-colors text-sm font-medium no-underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-bold text-lg mb-6">Contact Info</h4>
          <ul className="flex flex-col gap-4 text-sm font-medium text-muted/70">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Mumbai, Maharashtra<br/>Serving all western suburbs</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>dr.shantanu@example.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted/50 text-xs font-medium text-center md:text-left">
            © {new Date().getFullYear()} Dr. Shantanu Physiotherapy. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-muted/50">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-muted/20" />
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Bottom WhatsApp Strip */}
      <a 
        href="https://wa.me/910000000000" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-white text-center py-4 px-6 font-bold text-lg md:text-xl tracking-tight"
      >
        Book a home visit — WhatsApp us now
      </a>

    </footer>
  )
}

export default Footer
