import Header from '@/components/home/Header'
import React from 'react'
import HeroSection from '@/components/home/HeroSection'
import MiddleSlide from '@/components/home/MiddleSlide'
import Features from '@/components/home/Features'
import TestimonialSection from '@/components/home/Testimonial'
import Footer from '@/components/home/Footer'

const Layout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      
      <HeroSection/>
      <MiddleSlide/>
      <Features/>
      <TestimonialSection/>
      
      </div>
  )
}

export default Layout