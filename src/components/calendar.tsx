"use client";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({...props}: CalendarProps) {

    return (
        <DayPicker {...props}/>
    )
}
