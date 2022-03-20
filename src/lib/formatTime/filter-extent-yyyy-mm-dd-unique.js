  export default ((extent)=>{
  
  if (!extent.length) {
    return []
  }
  
  let daysExtent = extent.map(time=> time.slice(0,10))
  
  let uniqueDaysExtent = daysExtent.reduce(
    (unique, day) => (unique.includes(day) ? unique : [ ...unique, day ]),
    [],
  )

  return uniqueDaysExtent
  })
  
