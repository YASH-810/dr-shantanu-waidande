"use client"
import React, { useState } from 'react'

const faqData = [
  {
    question: 'How many sessions will I need?',
    answer: 'Depends on your condition. Most patients see improvement in 4–6 sessions. We give you a clear treatment plan after the first assessment.',
  },
  {
    question: 'What equipment do you bring?',
    answer: 'We carry all necessary equipment — TENS machine, ultrasound therapy, exercise bands, and more. You don\'t need to arrange or prepare anything.',
  },
  {
    question: 'What are your fees?',
    answer: 'Starting from ₹800 per session. Package rates are available. WhatsApp us for exact pricing based on your condition and location.',
  },
  {
    question: 'Do you provide receipts for insurance?',
    answer: 'Yes, we provide proper receipts for all sessions that can be used for insurance reimbursement.',
  },
]

const FAQItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border border-muted bg-background rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
      
      {/* Question Button */}
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left p-6 font-semibold text-lg text-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>{item.question}</span>
        
        {/* Chevron Icon */}
        <span className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-foreground/50 transition-all duration-300 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Answer Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[300px] border-t border-muted/50 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="p-6 text-foreground/80 leading-relaxed text-base m-0">
          {item.answer}
        </p>
      </div>

    </div>
  )
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0) // Keep the first FAQ open by default

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section id="faq" className="relative bg-muted/30 border-t border-muted/50 overflow-hidden py-24 px-6">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-6 h-px bg-primary" />
            Common Inquiries
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight m-0">
            Frequently Asked <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-foreground/70 mt-4 text-base">
            Everything you need to know about at-home physiotherapy sessions.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-4">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="text-center mt-16 p-8 rounded-3xl bg-background border border-muted shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="text-lg font-bold text-foreground m-0">Still have questions?</h4>
            <p className="text-foreground/60 text-sm mt-1 m-0">WhatsApp us for direct consultations and quick bookings.</p>
          </div>
          <a
            href="https://wa.me/?text=Hi%2C%20I%20have%20some%20questions%20about%20at-home%20physiotherapy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm no-underline shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.632-1.023-5.105-2.887-6.97C16.58 1.917 14.12 .89 11.5 1.018 6.064 1.018 1.64 5.441 1.636 10.871c-.001 1.716.463 3.393 1.343 4.887l-.988 3.606 3.656-.97zM17.7 14.78c-.286-.143-1.696-.838-1.959-.933-.262-.096-.454-.143-.645.143-.19.286-.738.934-.906 1.127-.167.19-.335.215-.62.072-2.91-1.454-4.803-4.542-5.467-5.69-.168-.288-.018-.444.125-.586.13-.127.287-.335.43-.502.143-.167.19-.286.286-.477.096-.19.048-.358-.024-.502-.072-.143-.645-1.552-.883-2.125-.23-.559-.462-.483-.645-.492-.167-.008-.358-.01-.55-.01-.19 0-.5.072-.762.358-.263.286-1.003.98-1.003 2.39 0 1.408 1.026 2.77 1.17 2.96.143.19 2.018 3.08 4.89 4.318.683.294 1.217.47 1.633.602.687.218 1.312.187 1.807.114.551-.082 1.696-.692 1.935-1.36.24-.668.24-1.24.167-1.36-.072-.12-.262-.19-.55-.335z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>

      </div>
    </section>
  )
}

export default FAQ
