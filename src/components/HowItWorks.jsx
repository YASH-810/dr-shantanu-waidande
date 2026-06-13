import React from 'react'

const steps = [
  {
    number: '1',
    title: 'WhatsApp Us',
    desc: 'Tell us your condition and preferred time',
    color: 'from-emerald-500 to-green-600',
    glow: 'shadow-emerald-500/15',
    numColor: 'text-emerald-600',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/15',
  },
  {
    number: '2',
    title: 'We Confirm',
    desc: 'Slot confirmed within 30 minutes',
    color: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/15',
    numColor: 'text-cyan-600',
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/15',
  },
  {
    number: '3',
    title: 'We Arrive',
    desc: 'Therapist arrives with all equipment',
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/15',
    numColor: 'text-violet-600',
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/15',
  },
  {
    number: '4',
    title: 'You Recover',
    desc: 'Treatment + follow-up plan given',
    color: 'from-rose-500 to-orange-500',
    glow: 'shadow-rose-500/15',
    numColor: 'text-rose-600',
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/15',
  },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative bg-muted/30 border-t border-muted/50 overflow-hidden py-24 px-6">

      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-6 h-px bg-primary" />
            Simple Process
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight m-0">
            How It <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-foreground/75 mt-4 text-base max-w-md mx-auto">
            Book professional physiotherapy at home in 4 simple steps — no app, no hassle.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center text-center gap-4">

              {/* Number circle */}
              <div className={`relative w-[104px] h-[104px] rounded-full ${step.bg} border ${step.border} flex items-center justify-center shadow-xl ${step.glow} transition-transform duration-300 hover:-translate-y-1`}>
                <span className={`text-5xl font-black ${step.numColor} leading-none`}>
                  {step.number}
                </span>
              </div>

              {/* Arrow for mobile */}
              {i < steps.length - 1 && (
                <div className="md:hidden text-foreground/20 text-2xl leading-none">↓</div>
              )}

              {/* Text */}
              <div>
                <h3 className="text-foreground font-bold text-lg m-0 leading-tight">{step.title}</h3>
                <p className="text-foreground/75 text-sm mt-1.5 m-0 leading-snug max-w-[160px] mx-auto">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 mt-16">
          <p className="text-foreground/60 text-sm">Ready to start? It only takes 2 minutes.</p>
          <a
            href="https://wa.me/?text=Hi%2C%20I%20want%20to%20book%20a%20physiotherapy%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            id="hiw-whatsapp-cta"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm text-white no-underline shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 3C8.82 3 3 8.82 3 16c0 2.4.64 4.64 1.76 6.57L3 29l6.61-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm5.8 18.7c-.32-.16-1.88-.93-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-1.88-.94-3.12-1.68-4.36-3.8-.33-.56.33-.52.94-1.74.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54-.18-.01-.39-.01-.6-.01s-.55.08-.84.39c-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.38 5.38 4.74 2 .87 2.79.94 3.79.79.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.14-.29-.22-.61-.38z" fill="#fff"/>
            </svg>
            Book Appointment on WhatsApp
          </a>
        </div>

      </div>
    </section>
  )
}

export default HowItWorks
