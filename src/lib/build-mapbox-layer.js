import buildWmsLayer from "./build-wms-layer"
import checkMapServiceType from "./check-map-service-type"
import buildWmtsLayer from "./build-wmts-layer"

export default (layer, dataServiceType, timeExtent, mapServiceVersion, bbox) => {
    const mapServiceType = checkMapServiceType(layer.url)
    if (mapServiceType === 'wms') {
        return buildWmsLayer({ ...layer, ...{ serviceType: dataServiceType }, ... { timeExtent: timeExtent }, ... { version: mapServiceVersion }, ... { bbox: bbox } })
    } else if (mapServiceType === 'wmts') {
       return buildWmtsLayer({ ...layer, ... { version: mapServiceVersion }, ... { bbox: bbox }, ... { serviceType: dataServiceType } })
    }
}
