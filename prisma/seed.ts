import { PrismaClient } from "@prisma/client";
import { Booking, Listing, Status, User, ContactInfo } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateDateRange } from "../src/helpers/bookingHelpers";

const prisma = new PrismaClient();

type UserData = Omit<User, "createdAt" | "updatedAt">;
type ListingData = Omit<Listing, "createdAt" | "updatedAt">;
type BookingData = Omit<Booking, "createdAt" | "updatedAt">;
type DBCount = { count: number };

async function main() {
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.user.deleteMany();

  const staticUserIds = {
    alice: "507f1f77bcf86cd799439011",
    bob: "507f1f77bcf86cd799439012",
    carol: "507f1f77bcf86cd799439013",
    dave: "507f1f77bcf86cd799439014",
    eve: "507f1f77bcf86cd799439015",
    frank: "507f1f77bcf86cd799439016",
    grace: "507f1f77bcf86cd799439017",
    heidi: "507f1f77bcf86cd799439018",
    ivan: "507f1f77bcf86cd799439019",
    judy: "507f1f77bcf86cd79943901a",
  };

  const contactInfoIds = {
    alice: "507f1f77bcf86cd799439034",
    bob: "507f1f77bcf86cd799439035",
    carol: "507f1f77bcf86cd799439036",
    dave: "507f1f77bcf86cd799439037",
    eve: "507f1f77bcf86cd799439038",
    frank: "507f1f77bcf86cd799439039",
    grace: "507f1f77bcf86cd79943903a",
    heidi: "507f1f77bcf86cd79943903b",
    ivan: "507f1f77bcf86cd79943903c",
    judy: "507f1f77bcf86cd79943903d",
  };

  const password = await bcrypt.hash("pass1234", 10);

  const userData: UserData[] = [
    {
      id: staticUserIds.alice,
      email: "alice@example.com",
      name: "Alice",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.bob,
      email: "bob@example.com",
      name: "Bob",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.carol,
      email: "carol@example.com",
      name: "Carol",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.dave,
      email: "dave@example.com",
      name: "Dave",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.eve,
      email: "eve@example.com",
      name: "Eve",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.frank,
      email: "frank@example.com",
      name: "Frank",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.grace,
      email: "grace@example.com",
      name: "Grace",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.heidi,
      email: "heidi@example.com",
      name: "Heidi",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.ivan,
      email: "ivan@example.com",
      name: "Ivan",
      password,
      role: "USER",
    },
    {
      id: staticUserIds.judy,
      email: "judy@example.com",
      name: "Judy",
      password,
      role: "ADMIN",
    },
  ];

  const listingData: ListingData[] = [
    {
      id: "507f1f77bcf86cd79943901b",
      createdById: staticUserIds.alice,
      name: "Cozy Cabin #1",
      description: "A lovely place to stay.",
      location: "Location 1",
      pricePerNight: 100,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd79943901c",
      createdById: staticUserIds.bob,
      name: "Cozy Cabin #2",
      description: "A lovely place to stay.",
      location: "Location 2",
      pricePerNight: 110,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd79943901d",
      createdById: staticUserIds.carol,
      name: "Cozy Cabin #3",
      description: "A lovely place to stay.",
      location: "Location 3",
      pricePerNight: 120,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd79943901e",
      createdById: staticUserIds.dave,
      name: "Cozy Cabin #4",
      description: "A lovely place to stay.",
      location: "Location 4",
      pricePerNight: 130,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd79943901f",
      createdById: staticUserIds.eve,
      name: "Cozy Cabin #5",
      description: "A lovely place to stay.",
      location: "Location 5",
      pricePerNight: 140,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439020",
      createdById: staticUserIds.frank,
      name: "Cozy Cabin #6",
      description: "A lovely place to stay.",
      location: "Location 6",
      pricePerNight: 150,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439021",
      createdById: staticUserIds.grace,
      name: "Cozy Cabin #7",
      description: "A lovely place to stay.",
      location: "Location 7",
      pricePerNight: 160,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439022",
      createdById: staticUserIds.heidi,
      name: "Cozy Cabin #8",
      description: "A lovely place to stay.",
      location: "Location 8",
      pricePerNight: 170,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439023",
      createdById: staticUserIds.ivan,
      name: "Cozy Cabin #9",
      description: "A lovely place to stay.",
      location: "Location 9",
      pricePerNight: 180,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439024",
      createdById: staticUserIds.judy,
      name: "Cozy Cabin #10",
      description: "A lovely place to stay.",
      location: "Location 10",
      pricePerNight: 190,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439025",
      createdById: staticUserIds.alice,
      name: "Cozy Cabin #11",
      description: "A lovely place to stay.",
      location: "Location 11",
      pricePerNight: 200,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439026",
      createdById: staticUserIds.bob,
      name: "Cozy Cabin #12",
      description: "A lovely place to stay.",
      location: "Location 12",
      pricePerNight: 210,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439027",
      createdById: staticUserIds.carol,
      name: "Cozy Cabin #13",
      description: "A lovely place to stay.",
      location: "Location 13",
      pricePerNight: 220,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439028",
      createdById: staticUserIds.dave,
      name: "Cozy Cabin #14",
      description: "A lovely place to stay.",
      location: "Location 14",
      pricePerNight: 230,
      reservedDates: [],
    },
    {
      id: "507f1f77bcf86cd799439029",
      createdById: staticUserIds.eve,
      name: "Cozy Cabin #15",
      description: "A lovely place to stay.",
      location: "Location 15",
      pricePerNight: 240,
      reservedDates: [],
    },
  ];

  const bookingData: BookingData[] = [
    {
      id: "507f1f77bcf86cd79943902a",
      listingId: "507f1f77bcf86cd79943901b",
      listingAgentId: staticUserIds.alice,
      renterId: staticUserIds.bob,
      contactInfoId: contactInfoIds.bob,
      checkin_date: new Date("2025-06-01"),
      checkout_date: new Date("2025-06-05"),
      total_cost: 400,
      status: Status.PENDING,
    },
    {
      id: "507f1f77bcf86cd79943902b",
      listingId: "507f1f77bcf86cd79943901d",
      listingAgentId: staticUserIds.carol,
      renterId: staticUserIds.dave,
      contactInfoId: contactInfoIds.dave,
      checkin_date: new Date("2025-06-10"),
      checkout_date: new Date("2025-06-15"),
      total_cost: 500,
      status: Status.PENDING,
    },
    {
      id: "507f1f77bcf86cd79943902c",
      listingId: "507f1f77bcf86cd79943901f",
      listingAgentId: staticUserIds.eve,
      renterId: staticUserIds.frank,
      contactInfoId: contactInfoIds.frank,
      checkin_date: new Date("2025-07-01"),
      checkout_date: new Date("2025-07-07"),
      total_cost: 600,
      status: Status.ACCEPTED,
    },
    {
      id: "507f1f77bcf86cd79943902d",
      listingId: "507f1f77bcf86cd799439021",
      listingAgentId: staticUserIds.grace,
      renterId: staticUserIds.heidi,
      contactInfoId: contactInfoIds.heidi,
      checkin_date: new Date("2025-04-10"),
      checkout_date: new Date("2025-04-13"),
      total_cost: 300,
      status: Status.DENIED,
    },
    {
      id: "507f1f77bcf86cd79943902e",
      listingId: "507f1f77bcf86cd799439023",
      listingAgentId: staticUserIds.ivan,
      renterId: staticUserIds.judy,
      contactInfoId: contactInfoIds.judy,
      checkin_date: new Date("2025-08-15"),
      checkout_date: new Date("2025-08-18"),
      total_cost: 350,
      status: Status.PENDING,
    },
    {
      id: "507f1f77bcf86cd79943902f",
      listingId: "507f1f77bcf86cd799439026",
      listingAgentId: staticUserIds.bob,
      renterId: staticUserIds.carol,
      contactInfoId: contactInfoIds.carol,
      checkin_date: new Date("2025-05-20"),
      checkout_date: new Date("2025-05-25"),
      total_cost: 550,
      status: Status.PENDING,
    },
    {
      id: "507f1f77bcf86cd799439030",
      listingId: "507f1f77bcf86cd799439027",
      listingAgentId: staticUserIds.carol,
      renterId: staticUserIds.ivan,
      contactInfoId: contactInfoIds.ivan,
      checkin_date: new Date("2025-09-01"),
      checkout_date: new Date("2025-09-04"),
      total_cost: 300,
      status: Status.PENDING,
    },
    {
      id: "507f1f77bcf86cd799439031",
      listingId: "507f1f77bcf86cd799439028",
      listingAgentId: staticUserIds.dave,
      renterId: staticUserIds.frank,
      contactInfoId: contactInfoIds.frank,
      checkin_date: new Date("2025-10-10"),
      checkout_date: new Date("2025-10-12"),
      total_cost: 200,
      status: Status.PENDING,
    },
    {
      id: "507f1f77bcf86cd799439032",
      listingId: "507f1f77bcf86cd799439029",
      listingAgentId: staticUserIds.eve,
      renterId: staticUserIds.ivan,
      contactInfoId: contactInfoIds.ivan,
      checkin_date: new Date("2025-11-05"),
      checkout_date: new Date("2025-11-09"),
      total_cost: 400,
      status: Status.DENIED,
    },
    {
      id: "507f1f77bcf86cd799439033",
      listingId: "507f1f77bcf86cd799439024",
      listingAgentId: staticUserIds.judy,
      renterId: staticUserIds.bob,
      contactInfoId: contactInfoIds.bob,
      checkin_date: new Date("2025-12-01"),
      checkout_date: new Date("2025-12-06"),
      total_cost: 500,
      status: Status.ACCEPTED,
    },
  ];

  const contactInfoData: ContactInfo[] = [
    // {
    //   id: contactInfoIds.alice,
    //   firstName: "Alice",
    //   lastName: "Smith",
    //   email: "alice@example.com",
    //   phoneNumber: "123-456-7890",
    //   userId: staticUserIds.alice,
    // },
    {
      id: contactInfoIds.bob,
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob@example.com",
      phoneNumber: "234-567-8901",
      userId: staticUserIds.bob,
    },
    {
      id: contactInfoIds.carol,
      firstName: "Carol",
      lastName: "Williams",
      email: "carol@example.com",
      phoneNumber: "345-678-9012",
      userId: staticUserIds.carol,
    },
    {
      id: contactInfoIds.dave,
      firstName: "Dave",
      lastName: "Brown",
      email: "dave@example.com",
      phoneNumber: "456-789-0123",
      userId: staticUserIds.dave,
    },
    // {
    //   id: contactInfoIds.eve,
    //   firstName: "Eve",
    //   lastName: "Jones",
    //   email: "eve@example.com",
    //   phoneNumber: "567-890-1234",
    //   userId: staticUserIds.eve,
    // },
    {
      id: contactInfoIds.frank,
      firstName: "Frank",
      lastName: "Garcia",
      email: "frank@example.com",
      phoneNumber: "678-901-2345",
      userId: staticUserIds.frank,
    },
    // {
    //   id: contactInfoIds.grace,
    //   firstName: "Grace",
    //   lastName: "Martinez",
    //   email: "grace@example.com",
    //   phoneNumber: "789-012-3456",
    //   userId: staticUserIds.grace,
    // },
    {
      id: contactInfoIds.heidi,
      firstName: "Heidi",
      lastName: "Hernandez",
      email: "heidi@example.com",
      phoneNumber: "890-123-4567",
      userId: staticUserIds.heidi,
    },
    {
      id: contactInfoIds.ivan,
      firstName: "Ivan",
      lastName: "Lopez",
      email: "ivan@example.com",
      phoneNumber: "901-234-5678",
      userId: staticUserIds.ivan,
    },
    {
      id: contactInfoIds.judy,
      firstName: "Judy",
      lastName: "Gonzalez",
      email: "judy@example.com",
      phoneNumber: "012-345-6789",
      userId: staticUserIds.judy,
    },
  ];

  const dbUserCount: DBCount = await prisma.user.createMany({
    data: userData,
  });

  const dbContactInfoCount: DBCount = await prisma.contactInfo.createMany({
    data: contactInfoData,
  });

  const dbListingCount: DBCount = await prisma.listing.createMany({
    data: listingData,
  });

  const dbBookingCount: DBCount = await prisma.booking.createMany({
    data: bookingData,
  });

  let bookedDates: { [listingId: string]: Date[] } = {};

  for (const booking of bookingData) {
    const requestedDates = generateDateRange(
      booking.checkin_date,
      booking.checkout_date
    );

    const reservedDates = bookedDates[booking.listingId] || [];
    bookedDates[booking.listingId] = [...reservedDates, ...requestedDates];
  }

  for (const listingId in bookedDates) {
    const reservedDates = bookedDates[listingId];
    await prisma.listing.update({
      where: { id: listingId },
      data: { reservedDates },
    });
  }

  console.log("users created: ", dbUserCount);
  console.log("listings created: ", dbListingCount);
  console.log("bookings created: ", dbBookingCount);
  console.log("contact info created: ", dbContactInfoCount);
  console.log("Seeding complete ✅");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seed: ", e);
    await prisma.$disconnect();
    process.exit(1);
  });
