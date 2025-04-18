import buildWmsLayer from "./build-wms-layer"
import checkMapServiceType from "./check-map-service-type"
import buildWmtsLayer from "./build-wmts-layer"

export default (layer, serviceType, timeExtent, version, bbox) => {
    const mapServiceType = checkMapServiceType(layer.url)
    if (mapServiceType === 'wms') {
        return buildWmsLayer({ ...layer, ...{ serviceType: serviceType }, ... { timeExtent: timeExtent }, ... { version: version }, ... { bbox: bbox } })
    } else if (mapServiceType === 'wmts') {
       return buildWmtsLayer({ ...layer, ... { version: version }})
    }
}
