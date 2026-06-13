"use client"
import React, { useRef, useState } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    recovery: 'Lower Back Pain Recovery',
    videoUrl: '/testimonials-1.mp4',
    rating: 5,
    quote: 'I was struggling with lower back pain due to long office hours. After a few weeks of treatment and guided exercises, I was able to work comfortably again without constant pain.',
  },
  {
    id: 2,
    name: 'Arjun Patel',
    recovery: 'Sports Injury Rehabilitation',
    videoUrl: '/testimonials-2.mp4',
    rating: 5,
    quote: 'After injuring my ankle during football, I thought recovery would take months. The personalized rehabilitation plan helped me regain strength and confidence, and now I am back on the field.',
  },
  {
    id: 3,
    name: 'Meera Desai',
    recovery: 'Knee Pain & Mobility Improvement',
    videoUrl: '/testimonials-3.mp4',
    rating: 5,
    quote: 'Years of knee pain made daily activities difficult. With regular physiotherapy sessions and guided exercises, my mobility improved significantly and I can now enjoy my daily walks again.',
  },
]

const VideoCard = ({ testimonial }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(err => {
          console.error("Video play failed:", err)
        })
      }
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation() // Prevent triggering togglePlay
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const handleMouseEnter = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div 
      className="relative w-full max-w-[320px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden bg-muted shadow-xl border border-muted/80 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
      onClick={togglePlay}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Patient Video */}
      <video
        ref={videoRef}
        src={testimonial.videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Hover Overlay Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/30 to-transparent z-10 transition-opacity duration-300 opacity-90 group-hover:opacity-95" />

      {/* Floating Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-muted text-foreground flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          /* Muted Icon */
          <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          /* Unmuted Icon */
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Central Play/Pause HUD Indicator (visible when paused or active) */}
      <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-all duration-300 ${isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        <div className="w-16 h-16 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-lg shadow-primary/30 backdrop-blur-sm">
          <svg className="w-8 h-8 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Video Caption & Info (Bottom Overlay) */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-5 text-white flex flex-col gap-2">
        {/* Rating Stars */}
        <div className="flex gap-0.5">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Patient Details */}
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight leading-tight m-0">{testimonial.name}</h4>
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">{testimonial.recovery}</span>
        </div>

        {/* Feedback Quote */}
        <p className="text-white/80 text-xs leading-normal font-medium m-0 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
          "{testimonial.quote}"
        </p>

        {/* Hover Cue */}
        <div className="text-[10px] text-white/40 text-center font-bold tracking-widest uppercase mt-1 transition-opacity duration-300 group-hover:opacity-0">
          Hover or tap to play
        </div>
      </div>
    </div>
  )
}

const Testimonials = () => {
  const sliderRef = useRef(null)
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e) => {
    setIsDown(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeft(sliderRef.current.scrollLeft)
  }
  const handleMouseLeaveSlider = () => setIsDown(false)
  const handleMouseUp = () => setIsDown(false)
  const handleMouseMove = (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 2
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk
    }
  }

  return (
    <section id="testimonials" className="relative bg-background overflow-hidden py-24 px-6 border-t border-muted/50">
      
      {/* Background Accent Glows */}
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-6 h-px bg-primary" />
            Patient Experience
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight m-0">
            Success <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Stories</span>
          </h2>
          <p className="text-foreground/70 mt-4 text-base max-w-md mx-auto">
            Listen to our patients share their real experiences of pain recovery and rehabilitation at home.
          </p>
        </div>

        {/* Video Slider */}
        <div 
          ref={sliderRef}
          className={`flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 md:px-0 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDown ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDown ? 'auto' : 'smooth' }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveSlider}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {testimonials.map((t) => (
            <div key={t.id} className="snap-center shrink-0 w-[80vw] max-w-[320px] pointer-events-none sm:pointer-events-auto">
              <div className="pointer-events-auto">
                <VideoCard testimonial={t} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Testimonials
