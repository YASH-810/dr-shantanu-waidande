import React from 'react'

const Hero = () => {
  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden flex items-end md:items-center">

      {/* Background Image — hero-m.png on mobile, hero1.png on desktop */}
      <div className="absolute inset-0 w-full h-full z-0">
        <picture style={{ width: '100%', height: '100%', display: 'block' }}>
          <source media="(max-width: 767px)" srcSet="/hero-m.png" />
          <source media="(min-width: 768px)" srcSet="/hero1-1.png" />
          <img
            src="/hero1.png"
            alt="Physiotherapist in clinic"
            className="w-full h-full object-cover object-top"
          />
        </picture>
      </div>

      {/* Gradient Overlay — bottom-up on mobile, left-side on desktop */}
      <div className="absolute inset-0 z-10 md:hidden" style={{ background: 'linear-gradient(to top, rgba(5,20,45,0.95) 0%, rgba(5,20,45,0.70) 45%, rgba(5,20,45,0.00) 75%)' }} />
      <div className="absolute inset-0 z-10 hidden md:block" style={{ background: 'linear-gradient(100deg, rgba(5,20,45,0.90) 0%, rgba(5,20,45,0.75) 38%, rgba(5,20,45,0.25) 58%, rgba(5,20,45,0.00) 70%)' }} />

      {/* Content */}
      <div className="relative z-20 max-w-2xl px-6 pb-12 pt-8 md:py-20 md:pl-[6vw]">

       
        {/* Headline */}
        <h1 className="m-0 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
          Professional<br />
          Physiotherapy<br />
          <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            At Your Doorstep
          </span>
        </h1>

        {/* Sub-text */}
        <p className="mt-5 text-lg text-white/80 leading-relaxed max-w-lg font-[Inter,system-ui,sans-serif]">
          No travel. No waiting room.<br />
          <strong className="text-white">Expert care where you need it.</strong>
        </p>

        {/* WhatsApp CTA */}
        <a
          id="hero-whatsapp-cta"
          href="https://wa.me/?text=Hi%2C%20I%20want%20to%20book%20a%20physiotherapy%20appointment"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 mt-8 px-7 py-3.5 rounded-full font-bold text-base text-white no-underline shadow-lg bg-primary hover:bg-primary/90 shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-primary/45 active:scale-95"
        >
          {/* WhatsApp SVG */}
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 3C8.82 3 3 8.82 3 16c0 2.4.64 4.64 1.76 6.57L3 29l6.61-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.6a10.55 10.55 0 0 1-5.37-1.47l-.38-.23-4 1.05 1.07-3.9-.25-.4A10.55 10.55 0 0 1 5.4 16C5.4 10.17 10.17 5.4 16 5.4S26.6 10.17 26.6 16 21.83 26.6 16 26.6zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-1.88-.94-3.12-1.68-4.36-3.8-.33-.56.33-.52.94-1.74.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54-.18-.01-.39-.01-.6-.01s-.55.08-.84.39c-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.38 5.38 4.74 2 .87 2.79.94 3.79.79.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.14-.29-.22-.61-.38z"
              fill="#fff"
            />
          </svg>
          Book Appointment on WhatsApp
        </a>

        {/* Trust Signals */}
        <div className="flex flex-wrap gap-5 mt-8">
          {[
            { icon: '⚡', label: 'Book in 2 minutes' },
            { icon: '🏠', label: 'At-home visits' },
            { icon: '🩺', label: 'Certified therapists' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-white/85 text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
