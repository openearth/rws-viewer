import { addDays, differenceInDays } from 'date-fns'

export default function (startDate, endDate) {
    
    const days = differenceInDays(endDate, startDate)
    return [ ...Array(days+1).keys() ].map((i) => addDays(startDate, i))
  
}
