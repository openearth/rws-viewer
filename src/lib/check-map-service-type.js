export default function (url) {
    // Check if the layer is a WMTS layer based on the URL 
    let mapServiceType
    const urlObject = new URL(url)
    if (urlObject.pathname.includes('wmts')) {
        mapServiceType = 'wmts'
    } else if (urlObject.pathname.includes('MapServer') || urlObject.pathname.includes('mapserver')) {
        mapServiceType = 'esri'
    } else {
        mapServiceType = 'wms'
    }
    return mapServiceType
}
