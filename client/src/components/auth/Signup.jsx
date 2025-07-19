import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Logo from '@/lib/Logo';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { EyeIcon, EyeOffIcon, UserIcon, MailIcon, LockIcon, Loader2Icon } from 'lucide-react';
import toast from 'react-hot-toast';
import { userSignUp } from '@/services/api.services';



const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userSignUp(data);
      if (response?.data?.success) {
        
        toast.success(response.data.message);
        navigate("/verify-email");
      }
    } catch(error) {
      setError(error.response?.data?.message || "An error occurred during signup");
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Left side decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-teal-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,200,200,0.15),transparent_70%)]" />
        
        <div className="relative flex flex-col justify-center items-center min-h-full z-10 px-12">
          <h1 className="text-5xl font-bold text-white mb-8">Join Our Learning Community</h1>
          <p className="text-xl text-gray-200 mb-8 max-w-md">
            Connect with learners, share resources, and achieve your academic goals together.
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-teal-500/30">
              <h3 className="text-teal-400 font-medium">Group Study</h3>
              <p className="text-gray-300 text-sm">Form study groups with peers</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-teal-500/30">
              <h3 className="text-teal-400 font-medium">Resource Sharing</h3>
              <p className="text-gray-300 text-sm">Exchange study materials</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-teal-500/30">
              <h3 className="text-teal-400 font-medium">Skill Matching</h3>
              <p className="text-gray-300 text-sm">Find complementary skills</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-teal-500/30">
              <h3 className="text-teal-400 font-medium">Study Scheduling</h3>
              <p className="text-gray-300 text-sm">Plan study sessions</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h2 className="text-3xl font-bold text-white">Create an Account</h2>
            <p className="text-gray-400 mt-2">Join thousands of students worldwide</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <UserIcon size={16} className="text-teal-500" />
                Username
              </label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Choose a username"
                  className="bg-gray-800/50 border-gray-700 text-white pl-4 focus-visible:ring-teal-500"
                  {...register("username", { 
                    required: "Username is required",
                    minLength: { value: 3, message: "Username must be at least 3 characters" } 
                  })}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <MailIcon size={16} className="text-teal-500" />
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="bg-gray-800/50 border-gray-700 text-white pl-4 focus-visible:ring-teal-500"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: "Invalid email address" 
                    } 
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <LockIcon size={16} className="text-teal-500" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className="bg-gray-800/50 border-gray-700 text-white pl-4 pr-10 focus-visible:ring-teal-500"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? 
               <Loader2Icon className="animate-spin" size={16} />
               : "Sign Up"}
            </Button>
            
            {/* <div className="text-center text-gray-400 text-sm">
              By signing up, you agree to our
              <Link to="/terms" className="text-teal-400 hover:text-teal-300 mx-1">Terms of Service</Link>
              and
              <Link to="/privacy" className="text-teal-400 hover:text-teal-300 ml-1">Privacy Policy</Link>
            </div> */}
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              Already have an account?
              <Link to="/login" className="text-teal-400 hover:text-teal-300 ml-1 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;