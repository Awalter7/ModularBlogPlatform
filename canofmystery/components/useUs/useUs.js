'use client'
import React from "react";
import Header from "../TextComponents/Header1"
import LargeParagraph from "../TextComponents/LargeParagraph"
import { MdArrowForwardIos } from "react-icons/md";
import { useRouter } from "next/navigation";




const UseUsAsASource = () => {
    const router = useRouter()

    return (
        <>
            <div className="flex justify-center h-max w-full items-center py-[100px] lg:py-[150px] px-[25px] lg:px-[50px] dark:bg-base-100-dark ">
                <div className="flex w-max h-full gap-0 sm:gap-[25px] lg:gap-[50px] justify-center">
                    <div className="flex flex-col w-full xl:w-[65vw] h-full gap-[25px] lg:gap-[50px]  ">
                        <Header type="lg" classes="grow text-3xl md:text-4xl subpixel-antialiased">
                            Use Our Work As a Resource
                        </Header>
                        <LargeParagraph classes="mt-0 lg:text-2.5xl xl:text-2.5xl 2xl:text-2.5xl 3xl:text-2.5xl w-full mr-0 antialiased">
                            We encourage you to use our resources and articles. If you are using this resource for an article or assignment of your own, or re-posting information from our blog for any reason, please credit the post's author, or if it is quoted/referenced material in our post please find and credit the original source...especially in the case of photographs.
                        </LargeParagraph>
                    </div>
                    <div className="w-[50px] md:w-max sm:grow flex flex-col justify-between lg:justify-start">
                        <Header type="lg" classes="grow text-3xl md:text-4xl opacity-0 h-max max-h-[40%]">
                            d
                        </Header>
                        <button className="w-max h-max p-3 hover:bg-base-200 border-3 border-[#ebebeb]  dark:border-2 dark:border-[#100f12] dark:hover:border-2 dark:hover:bg-base-100-dark rounded-md dark:hover:border-[#302c38]  ease-in-out transition duration-300" onClick={() => router.push("/pages/citation-guide", undefined, {shallow: true})}>
                            <MdArrowForwardIos className="text-2.5xl sm:text-3xl lg:text-5xl dark:text-t-header-dark grow" />
                        </button>
                        
                        <Header type="lg" classes="grow text-3xl md:text-4xl opacity-0 max-h-0">
                            d
                        </Header>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UseUsAsASource;


// We encourage you to use our resources and articles. If you are using this resource for an article or assignment of your own, or re-posting information from our blog for any reason, please credit the post's author, or if it is quoted/referenced material in our post please find and credit the original source...especially in the case of photographs.

