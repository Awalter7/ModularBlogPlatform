'use client'
import React, {useState} from "react";
import { Divider } from "@material-ui/core";
import Header from "../TextComponents/Header1";

const UserPanel = ({users}) => {

    const [selectedUser, setSelectedUser] = useState({userId: null, userName: null, userData: null})

    return(
        <div className="grid grid-rows-2 grid-cols-2 h-full w-full justify-between p-7 gap-7">
            <div className="flex flex-col justify-between gap-[25px] col-span-1 row-span-2 rounded-md border-3 p-7 pb-0 text-lg w-full">
                <div className="flex flex-col gap-[15px]">
                    <div className="w-full h-max flex flex-col">
                        <Header type="sm" >
                            Users
                        </Header>
                    </div>
                    <span className="text-lg underline decoration-dashed">
                        User First and Last Name.
                    </span>
                    <span className="text-lg">
                        {
                            selectedUser.userName
                            ?
                            <>
                                {selectedUser.userName}
                            </>
                            :
                            <>
                                No User Selected.
                            </>
                        }
                    </span>
                </div>
                <div className="h-full flex flex-col w-full gap-[25px]">
                    <div className="w-full flex flex-col grow gap-[15px]">
                        <div className="w-full flex h-min">
                            <div className="flex grow w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                First Name
                            </div>
                            <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                Last Name
                            </div>
                            <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                Session ID
                            </div>
                            <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                Has Published
                            </div>
                        </div>
                        <div className="flex w-full h-full max-h-[450px] xl:min-h-0 sm:h-auto sm:grow flex flex-col text-lg  rounded-t-md  border-3 border-b-0 bg-base-200 overflow-y-scroll scrollbar-hide">
                            {
                                users
                                ?
                                users.map((user, index) => (
                                    <div className={`flex justify-between w-full h-max bg-base-100 items-center shadow ${selectedUser.userId === user.userInfo.uid && "bg-base-200"} ${index === 0 && "rounded-t-md"} ${index !== (users.length - 1) && "border-b-3"}`} onClick={() => setSelectedUser({userId: user.userInfo.uid, userName: user.firstName + " " + user.lastName, userData: user})}>
                                        <div className="flex grow md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                            {user.firstName}
                                        </div>
                                        <Divider orientation="vertical"/>
                                        <div className="hidden md:flex basis-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                            {user.lastName}
                                        </div>
                                        <Divider orientation="vertical"/>
                                        <div className="hidden md:flex basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center min-h-[50px]">
                                            {user.sessionCode}
                                        </div>
                                        <Divider orientation="vertical"/>
                                        <div className={`hidden md:flex basis-[200px] 2xl:grow pl-[10px] py-[15px] items-center`}>
                                            {
                                            user.hasPublished
                                            ?
                                            "Has Published"
                                            :
                                            "Has Not Published"
                                            }
                                        </div>
                                    </div>
                                ))
                                :
                                <>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-[25px] col-span-1 row-span-2 rounded-md border-3 w-full p-7 text-lg">
                <Header type="sm">
                    User Info.
                </Header>
                {
                    !selectedUser.userData
                    &&
                    "Oops! It looks like no user has been selected."

                }
                <div className="flex gap-[25px] w-full">
                    {
                        selectedUser.userData
                        ?
                        <>
                            <div className="flex flex-col w-[50%]  h-full gap-[25px]">
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        First Name.
                                    </span>
                                    <span className="text-lg">
                                        {selectedUser.userData.firstName}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Last Name.
                                    </span>
                                    <span className="text-lg">
                                        {selectedUser.userData.lastName}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Display Name.
                                    </span>
                                    <span className="text-lg">
                                        {selectedUser.userData.userInfo.displayName}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Email.
                                    </span>
                                    <span className="text-lg">
                                        {selectedUser.userData.userInfo.email}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col w-[50%] h-full gap-[25px]">
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Student Writer.
                                    </span>
                                    <span className="text-lg">
                                        {
                                        selectedUser.userData.studentWriter
                                        ?
                                        "true"
                                        :
                                        "false"
                                        }
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Session Code.
                                    </span>
                                    <span className="text-lg">
                                        {selectedUser.userData.sessionCode}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Has Published.
                                    </span>
                                    <span className="text-lg">
                                        {
                                        selectedUser.userData.hasPublished
                                        ?
                                        "true"
                                        :
                                        "false"
                                        }
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        Is Admin
                                    </span>
                                    <span className="text-lg">
                                        {
                                        selectedUser.userData.adminPerm
                                        ?
                                        "true"
                                        :
                                        "false"
                                        }
                                    </span>
                                </div>
                                <div className="flex flex-col gap-[15px]">
                                    <span className="text-lg underline decoration-dashed">
                                        User ID
                                    </span>
                                    <span className="text-lg">
                                        {selectedUser.userData.userInfo.uid}
                                    </span>
                                </div>
                            </div>
                        </>
                        :
                        <>
                        </>
                    }
                </div>


            </div>
        </div>
    )
}

export default UserPanel;