export default function (url) {
    // Check if the layer is a WMTS layer based on the URL 
    let mapServiceType
    const urlObject = new URL(url)
    if (urlObject.pathname.includes('wmts')) {
        mapServiceType = 'wmts'
      } else {
        mapServiceType = 'wms'
      }
    return mapServiceType
}
