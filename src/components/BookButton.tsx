'use client'
import { useState } from "react"

export function BookButton() {
    const [isClicked, setIsClicked] = useState<boolean>(false)

    return (
        <button 
        className="border border-black p-1"
        onClick={()=>{
            setIsClicked(!isClicked)
        }}
        >Book Listing</button>
    )
}