export default ((time) => {
  const newFormat = time.replace('\r\n', '').trim()
  return newFormat
})
