import {Booking} from "@prisma/client"

type bookingData = Pick<Booking, "checkin_date" | "checkout_date">

type BookingStatus = Pick<Booking, "status">

enum Status {
    pending = "pending",
    accepted = "accepted", 
    denied = "denied"
  }