export function generateDateRange(start: Date, end: Date): Date[] {
    const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return Array.from({ length: daysDifference }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });

    //jämför med 
    // const requestedDates: Date[] = []

    // for (let i = 0; i <= numberOfDays; i++) {
    //     requestedDates.push(
    //         add(new Date(checkin_date), { days: i })
    //     )
    // }
}