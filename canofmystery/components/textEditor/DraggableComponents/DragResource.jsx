import React, { useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import { GrDrag } from "react-icons/gr";
import { TiDelete } from "react-icons/ti";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Resource from "../../TextComponents/Resource";

const DragResource = ({ comp, isEnabled, removeComp, updateContent, selected, onClick}) => {
    const contentRef = useRef();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: comp.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition
    };

  
    const handleKeyDown = (event) => {
        if (event.metaKey) {
            if (Object.values(FONTS).includes(event.key)) {
            event.preventDefault();
            transformText(event.key);
            }
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    });

    return(
        <div
            id="clickable-parent"
            ref={setNodeRef}
            style={style}
            className={`w-full justify-between ${
            ((selected.id === comp.id) && selected.eventType === "comp-click") && "border-[3px] w-[calc(100%_+_3px)]"
            } flex items-center gap-[15px] sm:gap-[30px] rounded-md `}
            onClick={(e) => onClick(e, comp.id, comp.type)}
        >
            <GrDrag 
                id={comp.id + "-grab"}
                {...attributes}
                {...listeners}
                className={`text-[25px] touch-none ${isEnabled && "hidden"} text-t-header-light dark:text-t-header-dark`}
                onMouseOver={(e) => (e.currentTarget.style.cursor = "move")}
            />   
            <Resource
                type={comp.size}
                id={comp.id} 
            >
                <ContentEditable 
                id="resource"
                html={comp.content}
                innerRef={contentRef}
                onChange={(event) => updateContent(comp.id, event.target.value, "text")}
                />
            </Resource>
            <TiDelete className={`text-[30px] ${isEnabled  && "hidden"} text-t-header-light dark:text-t-header-dark`} onClick={() => removeComp(comp.id)} onMouseOver={(e) => e.currentTarget.style.cursor = 'pointer'}/> 
        </div>
    )
}

export default DragResource;