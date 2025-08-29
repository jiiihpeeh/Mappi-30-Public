import { parse } from 'date-fns'
import dayjs from 'dayjs';


export function getLocaleNumberFormat(locale: string = "en-US"): { decimal: string; thousand: string } {
    const formatter = new Intl.NumberFormat(locale)
    const parts = formatter.formatToParts(123456.789)
  
    const decimal = parts.find((part) => part.type === "decimal")?.value || "."
    const thousand = parts.find((part) => part.type === "group")?.value || ","
    return { decimal, thousand }
}


export function dateStringToUnix(d:string):number{
    const parsedDate = parse(d, "dd.MM.yyyy HH:mm", new Date());
    return Math.floor(parsedDate.getTime() / 1000)
}


export function unixToDateString(time:number):string{
    return dayjs.unix(time).format('DD.MM.YYYY')
}

export function dateInfoToString(e: Array<number>): string{
    let datestring = `${e[0].toString().padStart(2, '0')}.${e[1].toString().padStart(2, '0')}.${e[2].toString().padStart(4, '0')} ${e[3] === 0 ? '12' : e[3].toString().padStart(2, '0')}:${e[4].toString().padStart(2, '0')}`
    return datestring
}

export function cleanPhoneNumber(input: string): string {
    return input.replace(/[^+\d()-\s]/g, "")
}

export function isBoolean(value: any):boolean {
    return typeof value === "boolean"
}

export function getMondayOfCurrentWeek():number {
    const now = new Date();
    const day = now.getDay(); // Get the current day of the week (0 = Sunday, 6 = Saturday)
    const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday (0) to get Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff); // Set the date to the previous or current Monday
    return Math.floor(monday.getTime() / 1000)
}

export function getEndOfDay():number {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // Set time to the last millisecond of the day
    return Math.floor(endOfDay.getTime() / 1000); // Convert to Unix timestamp (seconds)
}

export function sumArray(a: Array<number>):number{
    return a.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

export function formatDate(date = new Date(), separator = '-') {
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based, so add 1
    const year = date.getFullYear();
  
    return `${day}${separator}${month}${separator}${year}`;
}

export const isNumber = (val: any) => typeof val === "number" && val === val