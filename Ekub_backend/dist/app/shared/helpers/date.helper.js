"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateInNairobiTimezone = void 0;
// export const getDateInNairobiTimezone = (date: Date) => {
//   const nairobiTimeString = new Date(date).toLocaleString("en-US", {
//       timeZone: "Africa/Addis_Ababa",
//       hour12: false,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//     // Convert the formatted string back to a Date object
//   const [month, day, year, hour, minute, second] = nairobiTimeString
//   .replace(",", "")
//   .split(/\/| |:/)
//   .map((value) => parseInt(value));
//   return new Date(year, month - 1, day, hour, minute, second);
// };
const getDateInNairobiTimezone = (date) => {
    const nairobiTimeString = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Addis_Ababa",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(date);
    const dateParts = {};
    nairobiTimeString.forEach(({ type, value }) => {
        if (type !== "literal")
            dateParts[type] = parseInt(value, 10);
    });
    // Construct a UTC date using Nairobi time values
    return new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, dateParts.hour, dateParts.minute, dateParts.second));
};
exports.getDateInNairobiTimezone = getDateInNairobiTimezone;
