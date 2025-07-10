import dayjs from "dayjs"

export const formatTime = (time) => {
    return dayjs(time).format('DD-MM-YYYY HH:mm A')                              
     // ex-> 04-07-2025 05:24 PM
}