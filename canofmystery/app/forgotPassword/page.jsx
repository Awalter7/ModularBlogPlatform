
'use client'

import React, {useState} from "react";
import {  signInWithEmailAndPassword   } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import NeoButton from "../../components/TextComponents/NeoButton"
import { AnimatePresence, motion } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";
import {auth} from "../firebase"

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [loginErrorVisible, setLoginErrorVisible] = useState(false);
  const router = useRouter()

  const handleForm = async (event) => {
    event.preventDefault()
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      return router.push("/login");
    } catch (error) {
      console.log(error);
      setLoginErrorVisible(true); // Show error
      setTimeout(() => setLoginErrorVisible(false), 3000);
    }
  }


  return (
    <div className="w-full h-[100vh] flex items-center justify-center">
      <div class="flex flex-col justify-center self-center align-center p-7 w-[calc(100vw_-_29px)] sm:max-w-[450px] border-3 rounded-md shadow-lg m-7 sm:m-0">  
        <div class="mb-4">
          <h3 class="font-bold text-3xl text-gray-200">Forgot Password</h3>
        </div>
        <div >
          <form onSubmit={handleForm} className="flex flex-col gap-[15px]">
            <div className="flex flex-col">
                <label htmlFor="email" class="text-2xl font-semibold text-gray-700 tracking-wide mb-[10px]">
                  Email
                </label>
                <input 
                  onChange={(e) => setEmail(e.target.value)} required type="email" name="email" id="email"
                  class="text-xl xs:tracking-[-1.76px] w-full  3xl:h-max 3xl:text-2.5xl   lg:text-xl lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] border-2 lg:border-3 p-1 pr-3 rounded-md shadow-md  border-2 2xl:text-2xl lg:border-3 rounded-md shadow-md text-base px-4 py-2 border  border-gray-300 focus:outline-none focus:border-green-400" placeholder="mail@gmail.com" 
                />
                <AnimatePresence>
                  {loginErrorVisible && (
                      <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="rounded-md"
                          style={{ background: '#fd6666', marginTop: "5px", padding: "5px", color: "black", marginTop: "15px"}}
                      >
                          Whoa! You may have entered a wrong username or password. Please try again.
                      </motion.div>
                  )}
                </AnimatePresence>
            </div>

            <a href="/signup" class="text-green-400 hover:text-green-500  2xl:text-2xl">
                  Need an account? click here!
            </a>
            <NeoButton
              onSubmit={handleForm}
              type="submit" class="w-full mt-4 flex justify-center 2xl:text-2xl bg-primary-dark  hover:bg-green-200 text-t-header-light p-3 py-1 border-2 lg:border-3 shadow-md rounded-md tracking-wide font-semibold cursor-pointer"
            >
              Send Email
            </NeoButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage



  