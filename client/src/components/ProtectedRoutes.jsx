import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store => store.auth);
    console.log("protected routes", user);
    const navigate = useNavigate();
    useEffect(() => {
        if(!user){
            navigate("/");
        }
    },[user, navigate])

    if(!user){
        <div className='flex items-center justify-center min-h-screen'>
            <Loader2 size={24} className='animate-pulse'/>
        </div>
    }
  return (
    <>
        {children}
    </>
  )
}

export default ProtectedRoutes