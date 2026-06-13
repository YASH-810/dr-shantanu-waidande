import React from 'react';

const AboutDoctor = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Flex Container - Stacks vertically on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-gray-200">

          {/* LEFT COLUMN: Photo Container (35% width on desktop) */}
          <div className="w-full lg:w-1/3 flex justify-center">
            {/* Placeholder Image - Replace src and alt text */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 overflow-hidden rounded-full shadow-xl transform hover:scale-105 transition duration-300 border-4 border-blue-500/50">
              {/* IMPORTANT: Replace 'placeholder-doctor.jpg' with the actual image source */}
              <img 
                src="https://via.placeholder.com/300x300?text=Dr.+Photo" 
                alt="Profile picture of Dr. [Your Name]" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Content Area (65% width on desktop) */}
          <div className="w-full lg:w-2/3">
            
            {/* Professional Title */}
            <h1 className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Meet Dr. [Your Name]
            </h1>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
              Committed to Holistic Patient Care
            </h2>

            {/* Bio Paragraphs */}
            <div className="space-y-6 text-lg text-gray-700">
              <p>
                Dr. [Your Name] is a board-certified specialist with over 15 years of experience dedicated to improving patient outcomes through compassionate and evidence-based medicine. Their practice focuses on preventative care, ensuring patients receive not just treatment, but comprehensive health education.
              </p>
              <p className="border-l-4 border-blue-500 pl-4 italic pt-2">
                "My goal is to build a partnership with every patient, empowering them with knowledge so they feel confident in managing their long-term health."
              </p>
              <p>
                With advanced training in [Specialty Area] and a passion for medical innovation, Dr. [Name] believes that true healing starts with understanding the root cause of illness. They approach every case with empathy, precision, and the latest scientific research.
              </p>
            </div>

            {/* Expertise/Focus Areas */}
            <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                    Areas of Expertise:
                </h3>
                <ul role="list" className="space-y-3 text-base text-blue-700">
                    <li className="flex items-start">
                        <svg className="mt-1 flex-shrink-0 h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Comprehensive Preventative Care
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-1 flex-shrink-0 h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        [Specialty 1] Diagnosis and Treatment
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-1 flex-shrink-0 h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Patient Education & Counseling
                    </li>
                </ul>
            </div>

            {/* Call to Action Button */}
            <div className="mt-12">
              <a href="#contact" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                Book a Consultation 
                <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7M12 5v14"/></svg>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDoctor;
