import React from 'react'
import logo from '../assets/logo2.svg'

const Logo = () => {
  return (
    <div className='flex items-center gap-2'>
        <div className='w-16 h-16 rounded-lg'>
               <img src={logo} alt="logo"/> 
        </div>
    </div>
  )
}

export default Logo