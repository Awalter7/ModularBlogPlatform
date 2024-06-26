'use client'
import React from "react";
import { motion } from "framer-motion"


const NeoButton = ({children, classes, onClick, href}) => {
    if (href){
        return(
            <a href={href}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onClick} className={`flex flex-col neoButton overflow-hidden text-xl  min-w-max  3xl:h-max 3xl:text-2.5xl   lg:text-xl  border-2 lg:border-3 rounded-md shadow-md hover:shadow-md-move  ${classes}`}>
                    <div className="neoButton-animation z-0 ">
                        <div className="neoButton-rectangle">
        
                        </div>
                    </div>
                    <div className="w-max h-full flex items-center p-1 pr-2 z-10 lg:tracking-[-2.76px] xs:tracking-[-1.76px] xl:tracking-[-2.32px] tracking-[-5.76px]">
                        {children}
                    </div>
                </motion.button>
            </a>
        )
    }
    return(
        <motion.button onClick={onClick} className={`flex flex-col neoButton overflow-hidden text-xl min-w-max  3xl:h-max 3xl:text-2.5xl lg:text-xl border-2 lg:border-3 rounded-md shadow-md hover:shadow-md-move  ${classes}`} >
            <div className="neoButton-animation z-0 ">
                <div className="neoButton-rectangle">

                </div>
            </div>
            <div className="w-max h-full flex items-center p-1 pr-2 z-10 lg:tracking-[-2.76px] xs:tracking-[-1.76px] xl:tracking-[-2.32px] tracking-[-5.76px]">
                {children}
            </div>
            
        </motion.button>
    )
}

export default NeoButton;