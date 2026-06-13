import React from 'react'

const stats = [
  { value: '5+', label: 'Years Experience' },
  { value: '1,200+', label: 'Patients Treated' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const qualifications = [
  { icon: '🎓', title: 'BPT – Bachelor of Physiotherapy', sub: 'Rajiv Gandhi University of Health Sciences' },
  { icon: '🏅', title: 'MPT – Musculoskeletal & Sports', sub: 'Specialisation in Orthopaedic Rehabilitation' },
  { icon: '📋', title: 'Certified Manual Therapist', sub: 'IAPT Registered Practitioner' },
  { icon: '🏠', title: 'Home Visit Specialist', sub: 'Serving patients across the city since 2016' },
]

const About = () => {
  return (
    <section id="about" className="relative bg-background overflow-hidden py-24 px-6">

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── LEFT: Content ── */}
        <div className="flex flex-col gap-6">

          {/* Section label */}
          <span className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase">
            <span className="w-8 h-px bg-primary" />
            About the Therapist
          </span>

          {/* Name & title */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight m-0">
              Dr. Shantanu Waidande
            </h2>
            <p className="text-primary font-semibold mt-1 text-lg">
              Senior Physiotherapist &amp; Home Visit Specialist
            </p>
          </div>

          {/* Bio */}
          <p className="text-foreground/80 leading-relaxed text-base max-w-lg">
            With over <span className="text-foreground font-semibold">5 years of hands-on experience</span>, Dr. Shantanu specialises in musculoskeletal rehabilitation, sports injuries, and post-surgical recovery — all delivered in the comfort of your home. His patient-first approach has helped over 1,200 individuals regain mobility and live pain-free.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-2">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-3xl font-extrabold text-primary">{s.value}</span>
                <span className="text-foreground/60 text-sm mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-muted my-2" />

          {/* Qualifications */}
          <div className="flex flex-col gap-4">
            <h3 className="text-foreground/60 text-xs font-bold tracking-widest uppercase m-0">
              Qualifications &amp; Certifications
            </h3>
            {qualifications.map((q) => (
              <div key={q.title} className="flex items-start gap-3.5">
                <span className="text-xl mt-0.5">{q.icon}</span>
                <div>
                  <p className="text-foreground font-semibold text-sm m-0">{q.title}</p>
                  <p className="text-foreground/60 text-xs mt-0.5 m-0">{q.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="https://wa.me/?text=Hi%2C%20I%20want%20to%20book%20a%20physiotherapy%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 mt-2 self-start px-6 py-3 rounded-full font-bold text-sm text-white no-underline shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 3C8.82 3 3 8.82 3 16c0 2.4.64 4.64 1.76 6.57L3 29l6.61-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm5.8 18.7c-.32-.16-1.88-.93-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-1.88-.94-3.12-1.68-4.36-3.8-.33-.56.33-.52.94-1.74.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54-.18-.01-.39-.01-.6-.01s-.55.08-.84.39c-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.38 5.38 4.74 2 .87 2.79.94 3.79.79.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.14-.29-.22-.61-.38z" fill="#fff"/>
            </svg>
            Book a Session
          </a>
        </div>

        {/* ── RIGHT: Image ── */}
        <div className="relative flex justify-center lg:justify-end">

          {/* Decorative ring */}
          <div className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full border border-primary/15" />
          <div className="absolute inset-0 m-auto w-[440px] h-[440px] rounded-full border border-primary/8" />

          {/* Image card */}
          <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 border border-muted bg-background">
            <img
              src="/profile.png"
              alt="Dr. Shantanu Waidande – Senior Physiotherapist"
              className="w-full h-full object-cover object-center"
              style={{ aspectRatio: '4/5' }}
            />
            {/* Floating experience badge */}
            <div className="absolute bottom-5 left-5 flex items-center gap-3 bg-background/85 backdrop-blur-md border border-muted rounded-2xl px-4 py-3 shadow-lg">
              <span className="text-3xl font-extrabold text-primary">5+</span>
              <div>
                <p className="text-foreground text-xs font-bold m-0 leading-tight">Years of</p>
                <p className="text-foreground/70 text-xs m-0">Experience</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default About
