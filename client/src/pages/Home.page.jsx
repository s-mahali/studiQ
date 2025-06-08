import Footer from '@/components/home/Footer'
import Header from '@/components/home/Header'
import Layout from '@/lib/Layout'
import React from 'react'
import { Outlet } from 'react-router-dom'

const HomePage = () => {
  return (
    <div>
        
        <Outlet/>
        <Footer/>
    </div>
  )
}

export default HomePage