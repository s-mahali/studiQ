import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CheckCircle2, Mail, Clock } from 'lucide-react';
import { verifyEmail } from '@/services/api.services';



const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [remainingTime, setRemainingTime] = useState(10 * 60); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(60*3); // 3 minutes in seconds cooldown
  
  const navigate = useNavigate();
  
  // Countdown timer for 10 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Resend cooldown timer
  useEffect(() => {
    if (!resendDisabled) return;
    
    const timer = setInterval(() => {
      setResendCountdown(prevTime => {
        if (prevTime <= 1) {
          setResendDisabled(false);
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendDisabled]);
  
  // Format time to MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress for the progress bar
  const progressPercentage = (remainingTime / (10 * 60)) * 100;
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter your verification code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await verifyEmail({ verificationCode });
      if (res?.data?.success) {
        setSuccess(true);
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setResendDisabled(true);
    setResendCountdown(60);
    
    try {
      await api.post('/user/resend-verification');
      // Reset the 10-minute timer
      setRemainingTime(10 * 60);
    } catch (err) {
      setError('Failed to resend verification code. Please try again later.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-300">We've sent a verification code to your email address.</p>
        </div>
        
        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-400 font-medium">Email verified successfully!</p>
            <p className="text-gray-300 text-sm mt-1">Redirecting to login...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300 mb-1">
                  Verification Code
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="bg-gray-700/50 border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              <div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className={`text-teal-400 hover:text-teal-300 ${resendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleResendCode}
                  disabled={resendDisabled}
                >
                  {resendDisabled ? `Resend in ${resendCountdown}s` : "Resend Code"}
                </button>
                
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Expires in {formatTime(remainingTime)}</span>
                </div>
              </div>
            </form>
            
            {/* Progress bar */}
            <div className="mt-8">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-teal-500 h-1.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </>
        )}
        
        <p className="text-gray-400 text-sm text-center mt-8">
          Didn't receive an email? Check your spam folder or make sure your email address is correct.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;