import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import Label from "../../components/UI/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/UI/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/UI/Avatar";
import { Loader2, ArrowRight, Mail, Phone, UserCheck, Lock } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Input email/phone, 2: Verify OTP
  const [contactType, setContactType] = useState('email'); // 'email' or 'phone'
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  // Handle input change for email or phone
  const handleContactChange = (e) => {
    setContactValue(e.target.value);
    setError('');
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  // Handle request OTP button click
//   const handleRequestOtp = async () => {
//     // Validate email or phone
//     if (!contactValue) {
//       setError(`Please enter your ${contactType}`);
//       return;
//     }

//     if (contactType === 'email' && !/^\S+@\S+\.\S+$/.test(contactValue)) {
//       setError('Please enter a valid email address');
//       return;
//     }

//     if (contactType === 'phone' && !/^\d{10}$/.test(contactValue)) {
//       setError('Please enter a valid 10-digit phone number');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       // Simulating API call for sending OTP
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // In a real app, you would make an API call to send OTP
//       // const response = await sendOtp(contactType, contactValue);
      
//       setStep(2); // Move to OTP verification step
//     } catch (err) {
//       setError('Failed to send OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle OTP verification
//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       // Simulating API call for verifying OTP
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // In a real app, you would verify the OTP via API
//       // const response = await verifyOtp(contactType, contactValue, otp);
      
//       // If verification is successful, redirect to patient portal
//       navigate('/patients-side', { state: { userDetails: { [contactType]: contactValue } } });
//     } catch (err) {
//       setError('Invalid OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

const handleRequestOtp = async () => {
    if (!contactValue) {
      setError(`Please enter your ${contactType}`);
      return;
    }
  
    if (contactType === "email" && !/^\S+@\S+\.\S+$/.test(contactValue)) {
      setError("Please enter a valid email address");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(`${apiUrl}/otp/send-otp`, {
        email: contactValue,
      });
  
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(`${apiUrl}/otp/verify-otp`, {
        email: contactValue,
        otp,
      });
  
      navigate("/patients-side", { state: { userDetails: { email: contactValue } } });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render input fields for email or phone
  const renderContactInput = () => (
    <div className="space-y-4">
      <Tabs 
        defaultValue={contactType} 
        className="w-full" 
        onValueChange={setContactType}
      >
        <TabsList className="grid grid-cols-2 bg-teal-100">
          <TabsTrigger value="email" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Phone className="h-4 w-4 mr-2" />
            Phone
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="mt-4">
          <div className="space-y-2 space-x-2  ">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={contactValue}
              onChange={handleContactChange}
              className="border border-gray-200 p-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
            />
          </div>
        </TabsContent>
        <TabsContent value="phone" className="mt-4">
          <div className="space-y-2 space-x-2 ">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="10-digit phone number"
              value={contactValue}
              onChange={handleContactChange}
              className="border border-gray-200 p-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
            />
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <Button 
        className="w-full bg-teal-500 hover:bg-teal-600"
        onClick={handleRequestOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending OTP...
          </>
        ) : (
          <>
            Get OTP
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );

  // Render OTP verification fields
  const renderOtpVerification = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP</Label>
        <p className="text-sm text-gray-500">
          A 6-digit code has been sent to your {contactType} {contactType === 'email' ? contactValue : contactValue.replace(/(\d{3})(\d{3})(\d{4})/, '$1****$3')}
        </p>
        <Input
          id="otp"
          type="text"
          placeholder="6-digit OTP"
          value={otp}
          onChange={handleOtpChange}
          className="text-center text-lg font-medium tracking-widest border border-gray-200 p-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-300 outline-none"
          maxLength={6}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex flex-col space-y-2">
        <Button 
          className="w-full bg-teal-500 hover:bg-teal-600"
          onClick={handleVerifyOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Verify & Login
            </>
          )}
        </Button>
        
        <Button
          variant="link"
          className="text-teal-600"
          disabled={isLoading}
          onClick={() => setStep(1)}
        >
          Change {contactType}
        </Button>
        
        <Button
          variant="link"
          className="text-teal-600"
          disabled={isLoading}
          onClick={handleRequestOtp}
        >
          Resend OTP
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Avatar className="h-16 w-16 border-2 border-teal-500">
              <AvatarImage src="/logo.png" alt="MediCare Logo" />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                MC
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold text-teal-700">Patient Portal</CardTitle>
          <CardDescription>
            {step === 1 
              ? "Login to access your medical records and appointments" 
              : "Verify your identity to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 ? renderContactInput() : renderOtpVerification()}
        </CardContent>
      </Card>
    </div>
  );
}