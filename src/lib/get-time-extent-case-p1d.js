import createTimeSpan from './create-time-span'
import filterExtentYyyyMmDdUnique from './formatTime/filter-extent-yyyy-mm-dd-unique'

export default ((timeExtent)=>{
  if (!timeExtent.length) {
    return []
  }
  const startDate = new Date(timeExtent[0].trim())
  const endDate = new Date(timeExtent[1])

  const extent = createTimeSpan(startDate, endDate)
  const extentISO = (extent.map(time=> time.toISOString()))
  const daysExtent = filterExtentYyyyMmDdUnique(extentISO)
  
  return (daysExtent)

})
