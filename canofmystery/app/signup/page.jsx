'use client'

import React, { useState } from "react";

import { app } from "../../app/firebase"
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation'; // Corrected import
import NeoButton from "../../components/TextComponents/NeoButton";
import { AnimatePresence, motion } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { FaEyeLowVision } from "react-icons/fa6";
import firebase_app from "../../firebase/config";

import Header from "../../components/TextComponents/Header1"

const auth = getAuth(firebase_app);
const firestore = getFirestore(app);

import signUp from "../../firebase/auth/signup"

import {fetchSession } from "../../firebase/sessionUtils/sessionUtils"

const SignUpPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [panel, setPanel] = React.useState('cradentials');
  const [signUpErrorVisible, setSignUpErrorVisible] = useState(false);
  const [infoErrorVisible, setInfoErrorVisible] = useState(false)
  const [displayNameErrorVisible, setDisplayNameErrorVisible] = useState(false)
  const [sessionCodeErrorVisible, setSessionCodeErrorVisible] = useState(false)
  const [infoErrorMessage, setInfoErrorMessage] = useState("");
  const [displayNameErrorMessage, setDisplayNameErrorMessage] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [sessionCodeErrorMessage, setSessionCodeErrorMessage] = useState("");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const handleCradentials = async (event) => {
    event.preventDefault()

    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;

    // Check if email or password is empty
    if (!emailInput.trim() || !passwordInput.trim()) {
      setSignUpErrorVisible(true);
      setErrorMessage("Email and password are required.");
      setTimeout(() => setSignUpErrorVisible(false), 3000);
      return;
    }

    // Password length validation
    if (passwordInput.length < 8) {
      setSignUpErrorVisible(true);
      setErrorMessage("Password must be at least 8 characters long.");
      setTimeout(() => setSignUpErrorVisible(false), 3000);
      return;
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    if (!passwordRegex.test(passwordInput)) {
      setSignUpErrorVisible(true);
      setErrorMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      setTimeout(() => setSignUpErrorVisible(false), 3000);
      return;
    }

    try {
        const response = await signUp(emailInput, passwordInput);
        console.log(response)
        if(response.error && response.error.code === "auth/email-already-in-use"){
          setSignUpErrorVisible(true);
          setErrorMessage("The email you have chosen is already in use.");
          setTimeout(() => setSignUpErrorVisible(false), 3000);
          return;
        }

        console.log("here 8")
        setPanel("name")
        return;
        
    } catch (error) {
        console.log("Sorry, something went wrong. Please try again.");
        console.log(error);
    }
};

const isTimeInPast = (time) => new Date(time) < new Date()

const handleInfo = async (event) => {
  event.preventDefault();


  const sessionData = await fetchSession(sessionCode)

  console.log(sessionData)

  // Check if email or password is empty
  if (!firstName.trim() || !lastName.trim() && !displayName.trim() && !sessionCode.trim()) {
    setInfoErrorVisible(true);
    setInfoErrorMessage("First and Last name are required.");
    setDisplayNameErrorMessage(true);
    setDisplayNameErrorMessage("Display Name is Required.");
    setSessionCodeErrorMessage("Session Code is Required.");
    setTimeout(() => setInfoErrorVisible(false), 3000); 
    setTimeout(() => setDisplayNameErrorMessage(false), 3000);
    return;
  }else if (!firstName.trim() || !lastName.trim() && !displayName.trim()) {
    setInfoErrorVisible(true);
    setInfoErrorMessage("First and Last name are required.");
    setDisplayNameErrorMessage(true);
    setDisplayNameErrorMessage("Display Name is Required.");
    setTimeout(() => setInfoErrorVisible(false), 3000);
    setTimeout(() => setDisplayNameErrorMessage(false), 3000);
    return;
  }else if (!firstName.trim() || !lastName.trim() && !sessionCode.trim()) {
    setInfoErrorVisible(true);
    setInfoErrorMessage("First and Last name are required.");
    setSessionCodeErrorVisible(true)
    setSessionCodeErrorMessage("Session Code is Required.");
    setTimeout(() => setInfoErrorVisible(false), 3000);
  }else if(!displayName.trim() && !sessionCode.trim()){
    setDisplayNameErrorMessage(true);
    setDisplayNameErrorMessage("Display Name is Required.");
    setSessionCodeErrorVisible(true)
    setSessionCodeErrorMessage("Session Code is Required.");
    setTimeout(() => setDisplayNameErrorVisible(false), 3000);
    setTimeout(() => setSessionCodeErrorVisible(false), 3000);
  }else if(!firstName.trim() || !lastName.trim()){
    setInfoErrorVisible(true);
    setInfoErrorMessage("First and Last name are required.");
    setTimeout(() => setInfoErrorVisible(false), 3000);
  }else if(!displayName.trim()){
    setDisplayNameErrorVisible(true);
    setDisplayNameErrorMessage("Display Name is Required.");
    setTimeout(() => setDisplayNameErrorVisible(false), 3000);
  }else if(!sessionCode.trim()){
    setSessionCodeErrorVisible(true)
    setSessionCodeErrorMessage("Session Code is Required.");
    setTimeout(() => setSessionCodeErrorVisible(false), 3000);
    return;
  }else if(sessionData === null){
    setSessionCodeErrorVisible(true)
    setSessionCodeErrorMessage("This session code does not exist.");
    setTimeout(() => setSessionCodeErrorVisible(false), 3000);
    return;
  }else if(isTimeInPast(sessionData.Experation)){
    setSessionCodeErrorVisible(true)
    setSessionCodeErrorMessage("This session code is expired.");
    setTimeout(() => setSessionCodeErrorVisible(false), 3000);
    return;
  }

  try {
    console.log("here 1")
    const response = onAuthStateChanged(auth, async (user) => {
      if (user) {
          const userRef = doc(firestore, "users", user.uid);
          await updateDoc(userRef, {
              firstName: firstName,
              lastName: lastName,
              "userInfo.displayName": displayName,
              sessionCode: sessionCode && sessionCode,
              studentWriter: sessionCode ? true : false,
          });
      }
    });

    setPanel("done");
    console.log(response);
    router.push("/");
    return;
    
  } catch (error) {
      console.log("Sorry, something went wrong. Please try again.");
      console.log(error);
      return;
  }
};



  return (
    <div className="w-full h-[100vh] flex items-center justify-center duration-100 dark:bg-base-100-dark">

      <div className={"flex flex-col justify-center self-center align-center p-7 w-full w-full xs-sm:w-[calc(100vw_-_29px)] xs-sm:max-w-[450px] border-y-3 xs-sm:border-3 xs-sm:rounded-md xs-sm:shadow-lg xs-sm:m-7 xs-sm:m-0 transition-all duration-500 dark:border-2 dark:border-[#302c38] dark:shadow-md-move-dark"}>
        
          {panel === "cradentials" 
          ?
            <div className="mb-4">
              <h3 className="font-bold text-3xl text-gray-200 tracking-tighter dark:text-t-header-dark">Sign Up</h3>
            </div>
          :
            panel === "name"
            &&
            <div className="mb-4">
              <h3 className="font-bold text-3xl text-gray-200 tracking-tighter dark:text-t-header-dark">User Info</h3>
            </div>
          }
        
        <div >
          {
          panel === "cradentials"
          ?
          <form onSubmit={handleCradentials} className="flex flex-col gap-[25px]">
            <div className="flex flex-col w-full gap-[10px] dark:text-t-header-dark">
              <label htmlFor="email" className="text-2xl font-semibold text-gray-700 tracking-tighter">
                Email
              </label>
              <input 
                onChange={(e) => setEmail(e.target.value)} required type="email" name="email" id="email"
                className="text-xl xs:tracking-[-1.76px] w-full 3xl:h-max 3xl:text-2.5xl   lg:text-xl lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] border-2 lg:border-3 p-1 pr-3 rounded-md shadow-md  border-2 lg:border-3 rounded-md shadow-md text-base px-4 py-2 border  border-gray-300 focus:outline-none focus:border-green-400" placeholder="mail@gmail.com" 
              />
            </div>
            <div className="flex flex-col w-full gap-[10px]">
              <label htmlFor="password" className="text-2xl font-medium text-gray-700 tracking-tighter dark:text-t-header-dark">
                Password
              </label>
              <div className="max-w-full h-max flex justify-center items-center border-3 rounded-md shadow-md  pr-[3px] bg-[#ffffff]">

                <input
                  onChange={(e) => setPassword(e.target.value)} required type={isPasswordVisible ? "text" : "password"} name="password" id="password" 
                  className="text-xl xs:tracking-[-1.76px]  w-[calc(100%_-_37px)]  h-max 3xl:text-2.5xl   lg:text-xl lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] rounded-md p-1 pr-3  content-center text-base px-4 py-2 focus:outline-none focus:border-green-400" placeholder="Password" 
                /> 
                <button className="h-[37px] h-[37px] rounded-md p-[5px] pt-[3px] flex items-center hover:bg-base-200" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                  {
                    isPasswordVisible
                    ?
                    <FaEyeLowVision className="text-2.7xl"/>
                    :
                    <FaEye className="text-2.7xl"/>
                  }
                  
                </button>
              </div>

            <AnimatePresence>
              {signUpErrorVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0, paddingX: 0, paddingY: 0 }}
                  animate={{ opacity: 1, height: "auto",  paddingX: 15, paddingY: 10, }}
                  exit={{ opacity: 0, height: 0, paddingY: 0, paddingX: 0}}
                  transition={{ duration: 0.5 }}
                  className="rounded-md overflow-hidden p-[10px] px-[15px] tracking-tighter"
                  style={{ background: '#fd6666', color: "black", marginTop: "15px" }}
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>         
            </div>
            <a href="/login" className="text-green-400 hover:text-green-500 tracking-tighter w-full dark:text-t-header-dark">
                  Have an account? click here!
            </a>
            <NeoButton
              onSubmit={handleCradentials}
              type="submit" classes="w-max mt-4 flex justify-center bg-primary-dark  hover:bg-green-200 text-t-header-light p-3 py-1 border-2 lg:border-3 shadow-md rounded-md tracking-tighter font-semibold cursor-pointer"
            >
              Next
            </NeoButton>
          </form>
          :

          panel === "name"
          ?
          <form onSubmit={handleInfo} className="flex flex-col gap-[20px] ">
          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[10px]">
              <div className="flex w-full h-max items-center gap-[10px]">
                <label htmlFor="email" className="text-xl font-semibold text-gray-700 tracking-tighter dark:text-t-header-dark grow">
                  First Name
                </label>
                <label htmlFor="password" className="text-xl font-medium text-gray-700 tracking-tighter dark:text-t-header-dark grow">
                  Last Name
                </label>
              </div>
              <div className="flex flex-row w-full h-max gap-[20px]">
                <input 
                  onChange={(e) => setFirstName(e.target.value)} required type="text" name="FirstName" id="FirstName"
                  className="text-xl xs:tracking-[-1.76px] w-full 3xl:h-max lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] border-2 lg:border-3 p-1 pr-3 rounded-md shadow-md  border-2   lg:border-3 rounded-md shadow-md text-base px-4 py-2 border  border-gray-300 focus:outline-none focus:border-green-400" placeholder="First" 
                />
                <input
                  onChange={(e) => setLastName(e.target.value)} required type="text" name="LastName" id="LastName" 
                  className="text-xl xs:tracking-[-1.76px] w-full  3xl:h-max lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] border-2 lg:border-3 p-1 pr-3 rounded-md shadow-md    content-center text-base px-4 py-2 border  border-2 lg:border-3 rounded-md shadow-md focus:outline-none focus:border-green-400" placeholder="Last" 
                /> 

              </div>
            </div>
            <AnimatePresence>
                  {infoErrorVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, paddingX: 0, paddingY: 0 }}
                      animate={{ opacity: 1, height: "auto",  paddingX: 15, paddingY: 10, }}
                      exit={{ opacity: 0, height: 0, paddingY: 0, paddingX: 0}}
                      transition={{ duration: 0.5 }}
                      className="rounded-md overflow-hidden p-[10px] px-[15px] tracking-tighter"
                          style={{ background: '#fd6666', marginTop: "5px", color: "black", marginTop: "15px"}}
                      >
                        {infoErrorMessage}
                      </motion.div>
                  )}
            </AnimatePresence>   
            <div className="flex flex-col w-full gap-[10px]">
              <label htmlFor="email" className="text-xl font-semibold text-gray-700 tracking-tighter dark:text-t-header-dark">
                Display Name
              </label>
              <input 
                onChange={(e) => setDisplayName(e.target.value)} required type="displayName" name="displayName" id="displayName"
                className="text-xl xs:tracking-[-1.76px] w-full 3xl:h-max 3xl:text-2.5xl   lg:text-xl lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] border-2 lg:border-3 p-1 pr-3 rounded-md shadow-md  border-2   lg:border-3 rounded-md shadow-md text-base px-4 py-2 border  border-gray-300 focus:outline-none focus:border-green-400" placeholder="Name or Pseudonim" 
              />
            </div>
            <div className="flex flex-col w-full gap-[10px]">
              <label htmlFor="email" className="text-xl font-semibold text-gray-700 tracking-tighter dark:text-t-header-dark">
                Session Code
              </label>
              <input 
                onChange={(e) => setSessionCode(e.target.value)} type="sessionCode" requiredname="sessionCode" id="sessionCode"
                className="text-xl xs:tracking-[-1.76px] w-full 3xl:h-max 3xl:text-2.5xl   lg:text-xl lg:tracking-[-2.76px]  xl:tracking-[-2.32px] tracking-[-5.76px] border-2 lg:border-3 p-1 pr-3 rounded-md shadow-md  border-2   lg:border-3 rounded-md shadow-md text-base px-4 py-2 border  border-gray-300 focus:outline-none focus:border-green-400" placeholder="5D12gD" 
              />
                <AnimatePresence>
                  {sessionCodeErrorVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, paddingX: 0, paddingY: 0 }}
                        animate={{ opacity: 1, height: "auto",  paddingX: 15, paddingY: 10, }}
                        exit={{ opacity: 0, height: 0, paddingY: 0, paddingX: 0}}
                        transition={{ duration: 0.5 }}
                        className="rounded-md overflow-hidden p-[10px] px-[15px]"
                        style={{ background: '#fd6666', marginTop: "5px", color: "black", marginTop: "15px"}}
                      >
                        {sessionCodeErrorMessage}
                      </motion.div>
                  )}
              </AnimatePresence>   
            </div>
          </div>
          <NeoButton
            onSubmit={handleInfo}
            type="submit" classes="w-max mt-4 flex justify-center  bg-primary-dark  hover:bg-green-200 text-t-header-light p-3 py-1 border-2 lg:border-3 shadow-md rounded-md tracking-tighter font-semibold cursor-pointer"
          >
            Sign up
          </NeoButton>
        </form>
        :
        <>
          <div className="wrapper"> 
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"> <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/> <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <div>
                  <Header type="sm" classes="text-center">
                      Your all signed up
                  </Header>
          </div>
        </>

        }
        </div>
      </div>
    </div>
  )
}

export default SignUpPage