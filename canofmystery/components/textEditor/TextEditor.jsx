'use client'
import React, { useState, useEffect, useRef } from "react";

//Icons
import { FaItalic, FaBold, FaStrikethrough, FaUnderline, FaLink, FaListUl, FaListOl, FaCheck, FaCcJcb, FaAlignCenter, FaAlignRight, FaQuestion, FaAlignLeft, FaIndent, FaAlignJustify, FaSubscript, FaSuperscript    } from "react-icons/fa";
import { MdOutlinePreview, MdOutlineDownloadDone } from "react-icons/md";
import { RiFontSize, RiFontFamily } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";

import { useRouter } from 'next/navigation';

//other compoenents
import Dialog from '@mui/material/Dialog';
import { Button } from '@mui/material';
import NeoButton from "../TextComponents/NeoButton";
import Tag from "../TextComponents/NeoTag"
import Header from "../TextComponents/Header1";
import Help from "./Help/Help"
import addLinkHelp from "./Assets/help_add_link.gif"
import Image from "next/image"


//dragable componenets
import DragHeader from "./DraggableComponents/DragHeader";
import DragParagraph from "./DraggableComponents/DragParagraph"
import DragResource from "./DraggableComponents/DragResource";
import DragImage from "./DraggableComponents/DragImage";
import DragVideo from "./DraggableComponents/DragVideo"

//dnd library
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
    
  } from "@dnd-kit/sortable";
  import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor, // Add this line
    useSensor,
    useSensors
  } from "@dnd-kit/core";

//animation library
import { AnimatePresence, motion } from "framer-motion";

//styles
import "../../app/homepage.module.css"
import {  makeStyles  } from '@mui/styles'
import "../../app/globals.css"

//crop util library
import ControlPanel from "./ControlPanel"
import CropUtils from "./ImageEditor/CropUtils";
import {addDocument, setHasPublished, updateArticle, updatePage} from "../../firebase/articleUtils/articleUtils"

//firebase 
import firebase_app from '/firebase/config';
const auth = getAuth(firebase_app);
import { getAuth } from "@firebase/auth";

import { Timestamp } from "firebase/firestore";

const useStyles = makeStyles({
    button: {
        backgroundColor: "transparent",
        border: '3px solid transparent',
        minWidth: '0px',
        width: 'max-content',
        '&:hover': {
            backgroundColor: 'white',
            border: '2px solid black'
    },
}})


import useScrollPosition from "../../hooks/useScrollPosition"
import useWindowSize from "../../hooks/useWindowSize";

const SizeDropDown = ({className, onClick, selected}) => {
    return(
        <div className={`${className} flex flex-row gap-1 overflow-hidden  h-full min-w-max rounded-md ` }>
            <button id="sm" className="flex flex-row rounded-md justify-center items-end h-full pb-[5px] min-h-[50px] min-w-[50px] bg-base-100 hover:bg-[#a4a4a4] text-t-header-light transition duration-100 dark:bg-[#18161b] dark:hover:bg-[#302c38] dark:text-t-header-dark" onClick={(e) => onClick(e.currentTarget.id)}>
                <RiFontFamily id="sm" className="text-[8px] sm:text-xl"/>
            </button>
            <button id="md" className="flex flex-row rounded-md  justify-center items-end h-full  pb-[5px] min-h-[50px] min-w-[50px] bg-base-100 hover:bg-[#a4a4a4] text-t-header-light transition duration-100 dark:bg-[#18161b] dark:hover:bg-[#302c38] dark:text-t-header-dark" onClick={(e) => onClick(e.currentTarget.id)}>
                <RiFontFamily id="md" className="text-[10px] sm:text-2.2xl"/>
            </button>
            <button id="lg" className={`flex flex-row rounded-md  justify-center items-end h-full pb-[5px] min-h-[50px] min-w-[50px] ${selected.compType === "header" ? "bg-base-100 hover:bg-[#a4a4a4] transition duration-100 dark:bg-[#18161b] dark:hover:bg-[#302c38] dark:text-t-header-dark" : "bg-base-300 dark:bg-[#18161b] text-t-header-dark cursor-not-allowed"}`} onClick={(e) => {selected.compType === "header" && onClick(e.currentTarget.id)}}>
                <RiFontFamily id="lg" className="flex flex-col justify-end text-[12px] sm:text-2.7xl"/>
            </button>
            <button id="xl" className={`flex flex-row rounded-md  justify-center items-end h-full pb-[5px] min-h-[50px] min-w-[50px] ${selected.compType === "header" ? "bg-base-100 hover:bg-[#a4a4a4] transition duration-100 dark:bg-[#18161b] dark:hover:bg-[#302c38] dark:text-t-header-dark" : "bg-base-300 dark:bg-[#18161b] text-t-header-dark cursor-not-allowed"}`} onClick={(e) => { selected.compType === "header" && onClick(e.currentTarget.id)}}>
                <RiFontFamily id="xl" className="sm:text-3xl"/>
            </button>
        </div>
    )
}


const TextEditor = ({pageType, editorType, articleId, user, article, testing, canItems}) => {
    
    const router = useRouter();

    const classes = useStyles()

    const scrollPosition = useScrollPosition();
    const windowSize = useWindowSize();

    const editorRef = useRef(null);
    const controlPanelRef = useRef(null)
    const editOptionsRef = useRef(null)

    const [controlPanelOffset, setControlPanelOffset] = useState("0px");
    const [editOptionsOffset, setEditOptionsOffset] = useState("0px");
    const [cropUtilsOffset, setCropUtilsOffset] = useState({height: "0px", width: "0px"})

    const [controlPanelFixedPosition, setControlPanelFixedPosition] = useState();

    const [controlPanelFixed, setControlPanelFixed] = useState(false)

    const [compArray, setCompArray] = useState([]);

    const [panelOptions, setPanelOptions] = useState({info: "Info", add: "Add"})
    const [Title, setTitle] = useState("")
    const [Author, setAuthor] = useState("")
    const [Tags, setTags] = useState([])
    const [selectedCanItem, setSelectedCanItem] = useState("")
    const [imageData, setImageData] = useState([undefined, undefined])
    const [coverImageData, setCoverImageData] = useState([undefined, undefined])

    const [cropType, setCropType] = useState(null);
    
    const [linkValue, setLinkValue] = useState();
    const [currentLink, setCurrentLink] = useState("");
    const [linkErrorVisible, setLinkErrorVisible] = useState(false);
    const [isLinkAddHelpOpen, setIsLinkAddHelpOpen] = useState(false);
    const [isDoneNotificationOpen, setIsDoneNotificationOpen] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const [selectedComp, setSelectedComp] = useState({id: undefined, compType: undefined, eventType: undefined});
    const [sizeDrop, setSizeDrop] = useState(false);
    const [linkInput, setLinkInput] = useState(false);
    const [textIsSelected, setTextIsSelected] = useState(false)
    const [canAddList, setCanAddList] = useState(true);
    const [innerHtmlContent, setInnerHtmlContent] = useState([]);
    const [isPreview, setIsPreview] = useState(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [isCropEnabled, setIsCropEnabled] = useState({value: false, type: ""});
    const [isHelpOpen, setIsHelpOpen] = useState({value: false, type: null});

    const [pageName, setPageName] = useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserId(user.uid);
            } else {
                setIsLoggedIn(false);
                setUserId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if(article){
            setCompArray(article.Content);
            setTitle(article.Title)
            setAuthor(article.Author)
            setTags(article.Tags)
            setCoverImageData([article.CoverImage, article.CoverImage])
            setSelectedCanItem(article.CanItem)
            if(pageType === "page"){
                setPageName(article.PageName)
            }
        }
    }, [article])
    

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor), // Add this line
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates
        })
    );






    //Change Content Section ---------------------------------------------------------------------------------------------------------
    const handleItalicClick = () => {
        textIsSelected && document.execCommand("italic")
        
        
    };

    const handleBoldClick = () => {
        textIsSelected && document.execCommand("bold")
    };

    const handleUnderlineClick = () => {
        textIsSelected && document.execCommand("underline")
    };

    const handleStrikethroughClick = () => {
        textIsSelected && document.execCommand("strikeThrough")
    };

    const handleUnorderedListClick = () => {
        document.execCommand("insertUnorderedList")
        
    }

    const handleOrderedListClick = () => {
        document.execCommand("insertUnorderedList")
        
    }

    const handleSubScriptClick = () => {
        textIsSelected && document.execCommand("subscript")
    }

    const handleSuperScriptClick = () => {
        textIsSelected && document.execCommand("superscript")
        
    }

    function applyTailwindStyles(compId, styleClass) {
        setCompArray(compArray.map(comp => {
            if (comp.ID === compId) {
                let stylesToRemove = ["text-left", "text-center", "text-right", "text-justify"];

                let updatedStyle = comp.Style.includes(styleClass) ?
                    comp.Style.filter(s => s !== styleClass) :
                    comp.Style;
    
                if (stylesToRemove.includes(styleClass)) {
                    updatedStyle = updatedStyle.filter(s => !stylesToRemove.includes(s));
                    if (!comp.Style.includes(styleClass)) {
                        updatedStyle.push(styleClass);
                    }
                }else{
                    updatedStyle = updatedStyle.filter(s => s !== styleClass)
                    if (!comp.Style.includes(styleClass)) {
                        updatedStyle.push(styleClass);
                    }
                }
    
                return { ...comp, Style: updatedStyle };
            }
            return comp;
        }));
    }

    const handleSetLink = () => {
        const url = currentLink

        if(url){
            setLinkValue(url)
            setCurrentLink()
            setLinkErrorVisible(false)
            setLinkInput(!linkInput)
            document.getElementById("link-input").value === ""
        }else{
            setCurrentLink()
            setLinkErrorVisible(true)
            setTimeout(() => setLinkErrorVisible(false), 3000)
        }


    };

    const handleCreateLink = () => {
        document.execCommand("CreateLink", false, linkValue);
        setLinkValue();
    }
    

    const handleChangeSize = (id) => {
        setCompArray(compArray.map(comp => {
            if (comp.ID === selectedComp.id) {
                return { ...comp, Size: id};
            }
            return comp;
        }));
    };

    const updateContent = (id, content, type) => {
        setCompArray(compArray.map(comp => {
            if(type === "text"){
                if(comp.ID === id){
                    return { ...comp, Content: content};
                }
            }else if(type === "list"){
                if(comp.ID === id ){
                    return {...comp, ListItems: content}
                }
            }

            return comp;
        }));
    }

    const handleSelectComponent = (e, id, compType) => {

        let tagName = e.target.tagName
        let selectionName = window.getSelection().type

        if(tagName === "DIV" && (selectionName === "Caret" || selectionName === "None")){
            if(e.target.id && e.target.id !== "paragraph"){
                let eventType;

                if(e.target.id === "header" || e.target.id === "paragraph" || e.target.id === "resource"){
                    eventType = "in-text-click"
                }else{
                    eventType = "comp-click"
                }
        
                handleGetInnerHtml(e)
        
                if(selectedComp.id === id && eventType === selectedComp.eventType && eventType === "in-text-click"){
                    setSizeDrop(false);
                    setSelectedComp({id: id, compType: compType, eventType: eventType});
                }else if (selectedComp.id === id) {
                    // Toggle the dropdown only if the same component is clicked again
                    toggleSizeDropdown();
                    setSizeDrop(false);
                    setSelectedComp({id: undefined, compType: undefined, eventType: undefined});
                }else {
                    // Close the dropdown when a different component is selected
                    setSizeDrop(false);
                    setSelectedComp({id: id, compType: compType, eventType: eventType});
                }
                setCanAddList(false);
                setTextIsSelected(false);
            }else if(selectionName === "Caret"){
                setCanAddList(true)
                setTextIsSelected(false)
                setSizeDrop(false);
                setSelectedComp({id: undefined, compType: undefined, eventType: undefined});
            }
        }else if(selectionName === "Range"){
            setCanAddList(false);
            setTextIsSelected(true)
            setSizeDrop(false);
            setSelectedComp({id: undefined, compType: undefined, eventType: undefined});
        }else if(selectionName === "Caret"){
            setTextIsSelected(false)
            setSizeDrop(false);
            setSelectedComp({id: undefined, compType: undefined, eventType: undefined});
        }
    }




    
    const handleGetInnerHtml = (e) => {
        if(e.target.id === "clickable-parent"){
            setInnerHtmlContent([e.target.children[1].getAttribute('data-compid'), e.target.children[1].innerHTML]);
        }else{
            let nodeName = e.target.nodeName;
            if(nodeName === "svg"){
                let parent = e.target.parentElement;
                if(parent.id === "clickable-parent"){
                    setInnerHtmlContent([parent.children[0].getAttribute('data-compid'), e.target.innerHTML]);
                }
            }
        }
    }

      // Format date as a timestamp firebase.
    const formatDate = (date) => {
        return Timestamp.fromDate(date);
    };

    const handleAddComponent = (Type, url) => {
        const newId = compArray.length + 1;


        
        let newComponent;
        if(Type === "header"){
            newComponent = { Type: Type, Size: "md", Style: [], ID: `component-${newId}`, Content: "New Text", Image: "", OriginalImage: "", VideoEmbededId: "" };
        }else if(Type === "paragraph"){
            newComponent = { Type: Type, Size: "md", Style: [], ID: `component-${newId}`, Content: "New Text", Image: "", OriginalImage: "", VideoEmbededId: "" };
        }else if(Type === "image"){
            if(imageData[1]){
                newComponent = { Type: Type, Size: "", Style: [], ID: `component-${newId}`, Content: "", Image: imageData[1], OriginalImage: imageData[0], VideoEmbededId: "" };
            }else{
                newComponent = { Type: Type, Size: "", Style: [], ID: `component-${newId}`, Content: "", Image: imageData[0], OriginalImage: imageData[0], VideoEmbededId: "" };
            }
        }else if(Type === "resource"){
            newComponent = { Type: Type, Size: "md", Style: [], ID: `component-${newId}`, Content: "Test Resource", Image: "", originalImage: "", videoEmbededId: "" };
        }else if(Type === "list"){
            newComponent = { Type: Type, Size: "", Style: [], ID: `component-${newId}`, Content: "Test List", Image: "", OriginalImage: "", VideoEmbededId: ""  };
        }else if(Type === "youtube"){
            newComponent = { Type: Type, Size: "", Style: [], ID: `component-${newId}`, Content: "Test List", Image: "", OriginalImage: "", VideoEmbededId: url  };
        }
        setCompArray([...compArray, newComponent]);
    };

    
    const handleRemoveComponent = (id) => {
        // Remove the component from the array
        const newCompArray = compArray.filter((comp) => comp.ID !== id);

        // Renumber the component IDs based on their new order
        const renumberedCompArray = newCompArray.map((comp, index) => {
            return { ...comp, id: `component-${index + 1}` };
        });

        // Update the state with the renumbered components array
        setCompArray(renumberedCompArray);
    };



    useEffect(() => {
        const getContentById = (compArray, id) => {
            const element = compArray.find(item => item.id === id);
            return element ? element.content : null;
        }

        setInnerHtmlContent([innerHtmlContent[0], getContentById[compArray, innerHtmlContent[0]]])
    }, [compArray])

    useEffect(() => {
        if((editorRef.current.offsetTop + editorRef.current.clientHeight) <= (scrollPosition + windowSize.height)){
            setControlPanelFixed(true)
        }else{
            setControlPanelFixed(false)
        }
        if(editorRef.current){
            setEditOptionsOffset(`${(editorRef.current.clientHeight + (67 * 2)) - (windowSize.height)}px`)
            setControlPanelOffset(`${(editorRef.current.clientHeight + (67 * 2)) - (windowSize.height - editOptionsRef.current.clientHeight - 4)}px`)  
            
            if(isPanelOpen){
                setCropUtilsOffset({height: `${editOptionsRef.current.clientHeight + 4}px`, width: `${302}px`})
            }else{
                setCropUtilsOffset({height: `${editOptionsRef.current.clientHeight + 4}px`, width: `${79}px`})
            }
            
            setControlPanelFixedPosition(`${editOptionsRef.current.clientHeight + 71}px`)
        }
    }, [scrollPosition, windowSize])

    useEffect(() => {
        if(isPanelOpen){
            setCropUtilsOffset({height: `${editOptionsRef.current.clientHeight + 4}px`, width: `${302}px`})
        }else{
            setCropUtilsOffset({height: `${editOptionsRef.current.clientHeight + 4}px`, width: `${79}px`})
        }
        
    }, [isPanelOpen])

    const toggleSizeDropdown = () => {
        if (selectedComp) {
            setSizeDrop(prevState => !prevState);
        }
    }

    const togglePreviewEnabled = () => {
        setIsPreview(prevState => !prevState);
        setSelectedComp({id: undefined, compType: undefined, eventType: undefined});
    }

    const toggleSideBar = () => {
        setIsSideBarOpen(prevState => !prevState);
    }

    const handleExportContent = () => {
        const articleContent = {Author: Author, Publisher: "Undefined", Time: "Undefined", Title: Title, Content: compArray, Tags: Tags}
    }

    const handleUploadArticle = async () => {
        if(!testing){
            try {
                // Construct the article object
                let response;
                // Reference to the 'Articles' collection
                if(pageType === "blog"){
                    const article = {
                        Title: Title ? Title : "",
                        Tags: Tags,
                        CanItem: selectedCanItem,
                        Content: compArray.map(comp => ({
                            ID: comp.ID,
                            Content: comp.Content,
                            Style: comp.Style || '', // Assuming style is an optional field
                            Type: comp.Type,
                            ImageOriginal: comp.OriginalImage || '',
                            Image: comp.Image || '',
                            Size: comp.Size || ''
                        })),
                        firstName:  user && 'firstName' in user ? user.firstName : "",
                        lastName: user && 'lastName' in user ? user.lastName : "",
                        Time: formatDate(new Date()),
                        CoverImage: coverImageData[0] ? coverImageData[0] : null,
                        Approved: false,
                        Author: Author ? Author : "",
                        UserId: userId ? userId : "",
                        SessionCode: user && user.sessionCode ? user.sessionCode : ""
                    };
                    if(editorType !== "new"){
                        response = await updateArticle(articleId, article)

                        router.push(`/`, undefined, { shallow: true });
                    }else{
                        response = await addDocument("Articles", article) && await setHasPublished("users", userId);

                        router.push(`/`, undefined, { shallow: true });
                    }    
                }else if(pageType === "page"){
                    const page = {
                        Title: Title,
                        PageName: pageName,
                        Tags: Tags,
                        //CoverImage: (coverImageData[1] ? coverImageData[1] : coverImageData[0]),
                        Content: compArray.map(comp => ({
                            ID: comp.ID,
                            Content: comp.Content,
                            Style: comp.Style || '', // Assuming style is an optional field
                            Type: comp.Type,
                            ImageOriginal: comp.OriginalImage || '',
                            Image: comp.Image || '',
                            Size: comp.Size || ''
                        })),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        Time: formatDate(new Date()),
                        Approved: true,
                        Author: Author,
                        UserId: userId
                        
                    };
    
                    if(editorType !== "new"){
                        response = await updatePage(articleId, page)

                        router.push(`/admin`, undefined, { shallow: true });
                    }else{
                        response = await addDocument("Pages", page) && await setHasPublished("users", userId);

                        router.push(`/admin`, undefined, { shallow: true });
                    }
                }
            } catch (error) {
                console.error("Error adding article: ", error);
            }
        }
    };


    return (
        <>

            <div className="w-full" id="text-editor" ref={editorRef}>
                <div className="flex flex-col w-full h-max bg-[#302c38]"> 
                    <div ref={editOptionsRef} className={`flex flex-wrap flex-wrap w-full h-max px-1 md:px-[15px] bg-base-300  border-b-3 border-t-10 border-t-black dark:border-b-[#302c38] gap-1 dark:border-b-2 dark:bg-base-100-dark py-[3px] z-10 ${controlPanelFixed ? `absolute` : "fixed"}`} style={{top: controlPanelFixed ? editOptionsOffset : '67px'}}>
                        <div className="h-[50px] w-[50px] flext items-center justify-center">   
                            <button  className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${textIsSelected ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed"}`} onClick={handleBoldClick}>
                                <FaBold className="text-xl"/>
                            </button >
                        </div>
                        <div className="h-[50px] w-[50px] flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${textIsSelected ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed " }`} onClick={handleItalicClick}>
                                <FaItalic className="text-xl"/>
                            </button >
                        </div>
                        <div className="h-[50px] w-[50px] flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${textIsSelected ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={handleStrikethroughClick}>
                                <FaStrikethrough className="text-xl"/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${textIsSelected ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={handleUnderlineClick}>
                                <FaUnderline className="text-xl"/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${textIsSelected ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={handleSubScriptClick}>
                                <FaSubscript className="text-xl"/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${textIsSelected ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={handleSuperScriptClick}>
                                <FaSuperscript className="text-xl"/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${canAddList ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed dark:border-[#302c38]"}`} onClick={handleUnorderedListClick}>
                                <FaListUl className="text-xl"/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${canAddList ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed dark:border-[#302c38]"}`} onClick={handleOrderedListClick}>
                                <FaListOl className="text-xl"/>
                            </button >
                        </div>
                        <div className="flex flex-col md:flex-row content-center gap-[3px] h-max md:h-[50px] w-[50px]  md:w-max flext items-center justify-center">
                            <button  className={`flex justify-center items-center rounded-md min-w-[50px] max-w-[50px] min-h-[50px] max-h-[50px] relative top-[1px] ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={() => {((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") && toggleSizeDropdown()}}>
                                <RiFontSize className={`text-2xl sm:text-2.5xl text-t-header-dark ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "text-t-header-light dark:text-t-header-dark " : "text-t-header-dark "}`} />
                            </button >
                            <div className={`h-[50px] transition-transform duration-200 overflow-hidden ${sizeDrop ? "w-max flex" : "w-0 hidden"} `}>
                                <SizeDropDown selected={selectedComp} className={`w-max`} onClick={handleChangeSize} />
                            </div>

                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full w-[50px] h-[50px] rounded-md ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={() => applyTailwindStyles(selectedComp.id, "indent-8")}>
                                <FaIndent className={`text-xl ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "text-t-header-light text-t-header-light dark:text-t-header-dark" : "text-t-header-dark"}`}/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={() => applyTailwindStyles(selectedComp.id, "text-left")}>
                                <FaAlignLeft className={`text-xl ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "text-t-header-light text-t-header-light dark:text-t-header-dark" : "text-t-header-dark"}`}/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={() => applyTailwindStyles(selectedComp.id, "text-center")}>
                                <FaAlignCenter className={`text-xl ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "text-t-header-light text-t-header-light dark:text-t-header-dark" : "text-t-header-dark"}`}/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={() => applyTailwindStyles(selectedComp.id, "text-right")}>
                                <FaAlignRight className={`text-xl ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "text-t-header-light text-t-header-light dark:text-t-header-dark" : "text-t-header-dark"}`}/>
                            </button >
                        </div>
                        <div className="w-[50px] h-[50px]  flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] transition duration-100" : "bg-base-300 dark:bg-base-100-dark text-t-header-dark cursor-not-allowed "}`} onClick={() => applyTailwindStyles(selectedComp.id, "text-justify")}>
                                <FaAlignJustify className={`text-xl ${((selectedComp.compType  === "header" || selectedComp.compType === "paragraph" || selectedComp.compType === "resource") && selectedComp.eventType === "comp-click") ? "text-t-header-light dark:text-t-header-dark" : "text-t-header-dark"}`}/>
                            </button >
                        </div>

                        <div className="h-[50px] w-[50px] flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${(linkValue) ? 'bg-base-300 text-t-header-dark' : 'bg-base-100 hover:bg-[#a4a4a4] text-t-header-light dark:text-t-header-dark dark:bg-[#18161b] hover:dark:bg-[#302c38] '} transition duration-100`} onClick={() => setLinkInput(prevState => !prevState)}>
                                <FaLink className="text-xl"/>
                            </button >
                        </div>

                        {
                            linkValue
                            &&
                            <div className="w-[50px] h-[50px]  flext items-center justify-center">
                                <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md ${(linkValue)  ? "bg-base-100 text-t-header-light" : "bg-base-300 text-t-header-dark"}`} onClick={() => {(linkValue) && handleCreateLink()}}>
                                    <FaCheck className="text-xl"/>
                                </button >
                            </div>
                        }
                        <div className="h-[50px] w-[50px] flext items-center justify-center">
                            <button className={`flex justify-center items-center w-full h-full md:w-[50px] md:h-[50px] rounded-md bg-base-100 hover:bg-[#a4a4a4] dark:bg-[#18161b] hover:dark:bg-[#302c38]  text-t-header-light dark:text-t-header-dark transition duration-100`} onClick={togglePreviewEnabled}>
                                <MdOutlinePreview className="text-2xl sm:text-2.5xl"/>
                            </button>  
                        </div>
                        <div className="h-[50px] w-[50px] flext items-center justify-center">
                            <button className={`flex justify-center items-center w-[50px] h-[50px] rounded-md bg-base-100 hover:bg-[#a4a4a4] dark:bg-[#18161b] hover:dark:bg-[#302c38]  text-t-header-light dark:text-t-header-dark transition duration-100`} onClick={() => {setIsHelpOpen({value: !isHelpOpen.value, type: "menue"})}}>
                                <FaQuestion className='text-2.5xl' ></FaQuestion>
                            </button>  
                        </div>

                        {
                            !testing
                            &&
                            <div className="w-[50px] h-[50px]  flext items-center justify-center ">
                                <button className={`flex justify-center items-center w-max px-3 h-[30px] sm:h-full  border-r-[3px] bg-primary-dark text-t-header-light rounded-md`} onClick={() => setIsDoneNotificationOpen(true)}>
                                    Done
                                </button >
                            </div>
                        }

                    </div>
                    {
                        !isCropEnabled.value
                        &&
                        <>
                            <Dialog
                                open={isDoneNotificationOpen}
                                onClose={() => setIsDoneNotificationOpen(prevState => !prevState)}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                                maxWidth="max-content"
                                classes={{ paper: { borderRadius: '20px'}}}
                            >   
                                <div className="flex flex-col p-7 gap-[15px] bg-base-100">
                                    <Header type="sm" id="alert-dialog-title">
                                        {"Are you sure?"}
                                    </Header>
                                    <div>
                                        Please make sure this is how you want to submit the article.
                                    </div>
                                    {
                                        ((coverImageData.exists === false && coverImageData[0].exists === false) || Title.length === 0 || Author.length === 0 || Tags.length === 0 || compArray.length === 0)
                                        &&
                                        <>
                                            <span>You have left the following items blank:</span>
                                            <div className="flex flex-col gap-[10px] bg-[#fd6666] rounded-md p-3 w-max">
                                                
                                                {
                                                    (coverImageData[0] === undefined && coverImageData[1] === undefined)
                                                    &&
                                                    "Cover Image"
                                                }
                                                {
                                                    (Title.length === 0 && (coverImageData[0] === undefined && coverImageData[1] === undefined)) 
                                                    && 
                                                    <>, &nbsp;</> 
                                                } 
                                                {
                                                    Title.length === 0
                                                    &&
                                                    "Title"
                                                }
                                                {
                                                    (Title.length === 0 && Author.length === 0) 
                                                    && 
                                                    <>, &nbsp;</> 
                                                } 
                                                {
                                                    Author.length === 0
                                                    &&
                                                    "Author"
                                                }
                                                {
                                                    (Tags.length === 0  && Author.length === 0) 
                                                    && 
                                                    <>, &nbsp;</>  
                                                }  
                                                {
                                                    Tags.length === 0 
                                                    &&
                                                    "Tags"
                                                }
                                                {
                                                    (Tags.length === 0  && compArray.length === 0) 
                                                    && 
                                                    <>, &nbsp;</> 
                                                }
                                                {
                                                    compArray.length === 0
                                                    &&
                                                    "Content"
                                                }
                                            </div>
                                        </>
                                    }

                                    <NeoButton classes='flex items-center justify-center w-max p-[5px] bg-primary-dark rounded border-2 bg-primary-dark' onClick={() => {handleUploadArticle(); setIsDoneNotificationOpen(false)}}>
                                        Yes Im Sure!
                                    </NeoButton> 
                                </div>
                            </Dialog>
                                
                            
                        </>
                    }
                    <Help isOpen={isHelpOpen.value} setIsOpen={isOpen => setIsHelpOpen({value: isOpen, type: null})} type={isHelpOpen.type}/>
                </div>
                <div className="w-full " style={{height: cropUtilsOffset.height}}>

                </div>
                <div className="transition duration-200 flex flex-col xs-sm:flex-row w-full min-h-[90vh] overflow-x-hidden ">
                        
                    <div className={`transition duration-200 h-max flex items-center  xs-sm:max-w-max w-max`} ref={controlPanelRef}>
                        <div className={`transition duration-200 h-max z-10 xs-sm:max-w-max w-max z-10 ${controlPanelFixed ? `absolute` : "fixed"}`} style={{top: controlPanelFixed ? controlPanelOffset : controlPanelFixedPosition}}>
                            <ControlPanel 


                            enableCrop={(value, type) => setIsCropEnabled({value: value, type: type})} 

                            setImageToCrop={imageToCrop => setImageData([imageToCrop, imageData[1]])} 
                            imageToCrop={imageData[0]} 
                            setCroppedImage={croppedImage => setImageData([imageData[0], croppedImage])} 
                            croppedImage={imageData[1]} 
                            removeImage={() => setImageData([undefined, undefined])}

                            setCoverImageToCrop={coverImageToCrop => setCoverImageData([coverImageToCrop, coverImageData[1]])}
                            coverImageToCrop={coverImageData[0]}
                            setCroppedCoverImage={croppedCoverImage => setCoverImageData[coverImageData[0], croppedCoverImage]}
                            croppedCoverImage={coverImageData[1]}
                            removeCoverImage={() => setCoverImageData([undefined, undefined])}

                            panelOptions={panelOptions} 
                            handleAddComponent={handleAddComponent} 
                            setTitle={setTitle} 
                            Title={Title}

                            setAuthor={setAuthor} 
                            Author={Author}
                            currentAuthor={Author} 

                            setTags={setTags} 
                            tags={Tags} 

                            setSelectedCanItem={setSelectedCanItem} 
                            selectedCanItem={selectedCanItem}

                            innerHtml={innerHtmlContent} 
                            exportContent={handleExportContent} 

                            canItems={canItems}

                            pageName={pageName}
                            setPageName={setPageName}
                            pageType={pageType}
                            
                            setCropType={setCropType}
                            isCropEnabled={isCropEnabled.value}
                            setIsHelpOpen={(value, type) => setIsHelpOpen({value: value, type: type})}
                            isPanelOpen={isPanelOpen}
                            setIsPanelOpen={setIsPanelOpen}
                            
                            />
                        </div>
                    </div>

                    <div className="flex w-full">
                        <div style={{width: cropUtilsOffset.width, transition: 'width 0.3s ease-in-out'}}>

                        </div>
                        {
                            isCropEnabled.value
                            &&
                            <div className={`flex flex-col items-center lg:w-[${cropUtilsOffset.width}] xs-sm:min-w-[100vw] lg:min-w-0 lg:grow m-2 rounded-md overflow-hidden min-h-[100vh] z-0`}>
                                <CropUtils 
                                imageToCrop={(isCropEnabled.type === "comp") 
                                ? 
                                imageData[0] 
                                : 
                                coverImageData[0]
                                } 

                                onImageCropped={(isCropEnabled.type  === "comp") 
                                ? 
                                croppedImage => {setImageData([imageData[0], croppedImage]); setIsCropEnabled({value: false, type: ''})}
                                : 
                                croppedCoverImage => {setCoverImageData([coverImageData[0], croppedCoverImage]); setIsCropEnabled({value: false, type: ''})}} 

                                cropType={cropType}
                                ratios={(isCropEnabled.type  === "comp") ? [1,4] : [2,2]}
                                />
                            </div>
                        }
                    
                        <div  className={`flex flex-col items-center min-w-[100vw] lg:min-w-0 lg:grow  h-full min-h-[100vh] overflow-y-scroll px-[25px] md:pl-[30px] pb-[100px] md:pt-[100px] xs:pt-[200px] xs-sm:pt-[150px]  ${isCropEnabled.value && "hidden"}`}>

                            <div className={`flex w-full`}>
                                <div className={`w-full h-max md:grow flex ${!isPreview && "px-[51px]"} md:px-0 justify-center`}>
                                    <div className="w-full md:w-[800px] h-max flex flex-col items-center">
                                        <div className={`flexitems-center w-full ${isPreview ? "md:w-full" : "md:w-[692px]"} gap-[30px]`} >
                                            <Header type={"lg"} classes="p-0 text-center" >
                                                {Title}
                                            </Header>
                                        </div>
                                        <div className={`flex items-center w-full ${isPreview ? "md:w-full" : "md:w-[692px]"} gap-[30px]`} >
                                            <div className="flex w-full items-center">
                                                {
                                                    Author
                                                    &&
                                                    <Header type={"sm"} classes="w-max">
                                                        By: <span className="font-normal">{Author}</span>
                                                    </Header>
                                                }

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-max flex flex-col justify-between">
                                <Dialog
                                    open={linkInput}
                                    onClose={() => setLinkInput(prevState => !prevState)}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"

                                >   
                                    <div className="flex flex-col p-[15px] max-w-[350px] gap-[15px] bg-base-100">
                                        <Header type="sm" id="alert-dialog-title" >
                                            {"Enter The URL."}
                                        </Header>
                                        <div className="flex gap-[10px]">
                                            <input id="link-input" className="w-[calc(100%_-_25px)] p-[5px] rounded" placeholder={"Enter a URL."} onChange={(e) => setCurrentLink(e.currentTarget.value)}>
                                            </input>
                                            <button className='flex items-center justify-center w-[45px] bg-primary-dark rounded border-2'>
                                                <MdOutlineDownloadDone className='text-2.5xl' onClick={() => {handleSetLink(); setLinkInput(false)}}></MdOutlineDownloadDone>
                                            </button>   
                                        </div>
                                        <AnimatePresence>
                                            {linkErrorVisible && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{ background: '#fd6666', marginTop: "5px", padding: "5px", borderRadius: "5px", color: "black"  }}
                                                >
                                                    Please Eneter A URL
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className="flex justify-between">
                                            <div className="w-[calc(100%_-_25px)] p-[5px] text-[12px] tracking-tighter">
                                                Enter the url, then highlight your text, and click the checkmark next to the link icon.
                                            </div>
                                            <button className='flex items-center justify-center w-[45px]'>
                                                <FaQuestion className='text-2.5xl' onClick={() => {setIsHelpOpen({value: true, type: "link_help"})}}></FaQuestion>
                                            </button>
                                            {
                                                isLinkAddHelpOpen
                                                &&
                                                <Dialog
                                                    open={isLinkAddHelpOpen}
                                                    onClose={() => setIsLinkAddHelpOpen(prevState => !prevState)}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                    maxWidth="max-content"
                                                >   
                                                    <div className='overflow-hidden'>
                                                        <div className='flex justify-end w-full h-0'>
                                                            <Button  className={`z-10 m-[10px] h-min rounded-[30px] ${classes.button}`} disableRipple >
                                                                <TiDelete
                                                                    className={`text-[30px] text-base-300`}
                                                                    onMouseOver={(e) => (e.currentTarget.style.cursor = "pointer")}
                                                                    onClick={() => setIsLinkAddHelpOpen(prevState => !prevState)}
                                                                />
                                                            </Button>
                                                        </div>
                                                        <Image src={addLinkHelp} className="w-auto h-[30vh] object-cover md:w-[800px] md:h-auto  z-0 overflow-hidden" /> 
                                                    </div>
                                                </Dialog>
                                            }
                                        </div>
                                    </div>
                                </Dialog>
                                <div className="grow flex flex-col items-center h-full z-1 gap-[10px] ">
                                    <div className="flex-col w-full md:w-[800px]" id="text-editor-container" >
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext items={compArray.map(comp => comp.ID)} strategy={verticalListSortingStrategy}>
                                                {compArray.map((comp, index) => (
                                                    <div key={index}>
                                                        {
                                                            comp.Type === "header" 
                                                            ? 
                                                            <>
                                                                <DragHeader key={index} comp={comp} isEnabled={isPreview} removeComp={handleRemoveComponent} updateContent={updateContent} index={index} selected={selectedComp.id === comp.ID && selectedComp.eventType === "comp-click"}  onClick={handleSelectComponent}/>
                                                            </>
                                                            :
                                                            
                                                            comp.Type === "image" 
                                                            ? 
                                                            <>
                                                                <DragImage key={index} comp={comp} isEnabled={isPreview} removeComp={handleRemoveComponent} updateContent={updateContent} index={index} selected={selectedComp.id === comp.ID && selectedComp.eventType === "comp-click"}  onClick={handleSelectComponent}/>
                                                            </>
                                                            :
                                                            comp.Type === "paragraph" 
                                                            ? 
                                                            <>
                                                                <DragParagraph  key={index} comp={comp} isEnabled={isPreview} removeComp={handleRemoveComponent} updateContent={updateContent} index={index} selected={selectedComp.id === comp.ID && selectedComp.eventType === "comp-click"} onClick={handleSelectComponent}/>          
                                                            </>
                                                            :
                                                            comp.Type === "resource" 
                                                            ? 
                                                            <>
                                                                <DragResource  key={index} comp={comp} isEnabled={isPreview} removeComp={handleRemoveComponent} updateContent={updateContent} index={index} selected={selectedComp.id === comp.ID && selectedComp.eventType === "comp-click"}  onClick={handleSelectComponent}/>
                                                            </>
                                                            :
                                                            comp.Type === "youtube" 
                                                            && 
                                                            <>
                                                                <DragVideo key={index} comp={comp} isEnabled={isPreview} removeComp={handleRemoveComponent} updateContent={updateContent} index={index} selected={selectedComp.id === comp.ID && selectedComp.eventType === "comp-click"}  onClick={handleSelectComponent}/>
                                                            </>
                                                        }
                                                    </div>
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                        <div className={`transition duration-1 flex items-center w-full gap-[30px] ${Tags.length > 0 ? "opacity-1" : "opacity-0"} ${!isPreview && "px-[51px]"}`} >
                                            <div className="flex flex-col h-max w-full gap-[15px]">
                                                <Header type="sm" classes="border-b-[2px] border-b-black dark:border-b-2 dark:border-b-[#ebebeb] w-full">
                                                    Tags:
                                                </Header>
                                                <div className="flex flex-wrap items-center w-full h-max">
                                                    {Tags.map((tag, index) => (
                                                        <Tag key={`${index}-${tag.Text}`} backgroundColor={tag.Color} tag={tag.Text} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`transition duration-1 flex items-center w-full gap-[30px] mt-[15px] ${selectedCanItem ? "opacity-1" : "opacity-0"} ${!isPreview && "px-[51px]"}`} >
                                            <Header type="sm" classes="border-b-black max-w-max">
                                                Can Item:
                                            </Header>
                                            <div className="flex w-full items-center gap-[15px]">
                                                <Tag  backgroundColor={"#29ff80"} tag={selectedCanItem} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                 
            </div>
        </>
    );

    function handleDragEnd(event) {
        const { active, over } = event;
    
        if (active.id !== over.id) {
            setCompArray((compArray) => {
                const oldIndex = compArray.findIndex(comp => comp.ID === active.id);
                const newIndex = compArray.findIndex(comp => comp.ID === over.id);
                const newArray = arrayMove(compArray, oldIndex, newIndex);
    
                // Reassign IDs based on the new order
                const renumberedArray = newArray.map((comp, index) => ({
                    ...comp,
                    id: `component-${index + 1}`
                }));
    
                return renumberedArray;
            });
        }
    }
    
};

export default TextEditor;