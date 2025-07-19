import Header from '@/components/home/Header'
import React from 'react'
import HeroSection from '@/components/home/HeroSection'
import Features from '@/components/home/Features'
import TestimonialSection from '@/components/home/Testimonial'
import FindPeersStatic from '@/components/home/FindPeersStatic'

const Layout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      
      <HeroSection/>
      <FindPeersStatic/>
      <Features/>
      <TestimonialSection/>
      
      </div>
  )
}

export default Layout