import { stringify } from "query-string";

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL;

export function buildWmtsLayer ({
  url: rawUrl = defaultUrl,
  id,
  layer,
  workspace,
  styles = "",
  paint = {
    // TODO: make this configurable
    'fill-color': '#FF0000',
  },
  time,
  filter,
  version,
  acceptedFormats,
})  {
  const url = new URL(rawUrl);
  const searchParamEntries = url.searchParams.entries();
  const searchParamsObject = Object.fromEntries(searchParamEntries);

  const isVectorLayer = acceptedFormats.includes('application/vnd.mapbox-vector-tile');

  const tile = buildWmtsGeoserverUrl({
    request: "GetTile",
    version,
    layer: workspace ? `${ workspace }:${ layer }` : layer,
    style: styles,
    url: url.origin + url.pathname,
    transparent: true,
    encode: false,
    format: isVectorLayer ? 'application/vnd.mapbox-vector-tile' : 'image/png',
    ...(time && { time: time }),
    ...(filter && { cql_filter: filter }),
    ...searchParamsObject,
  });

  if (isVectorLayer) {
    return {
      source: {
        id,
        key: layer,
        type: "vector",
        tiles: [ tile ],
        minZoom: 6,
        maxZoom: 20,
      },
      layer: {
        id,
        type: "fill",
        source: layer,
        "source-layer": layer,
        paint,
      },
    };
  } else {
    return {
      source: {
        id,
        key: layer,
        type: "raster",
        tiles: [ tile ],
      },
      layer: {
        id,
        type: "raster",
        source: layer,
      },
    };
  }
}


export function buildWmtsGeoserverUrl({
  url,
  service="WMTS",
  request,
  version = "1.0.0.",
  layer,
  style="",
  tilematrix = "EPSG:900913:{z}",
  tilematrixset = "EPSG:900913",
  format = "application/vnd.mapbox-vector-tile",
  tilecol = "{x}",
  tilerow = "{y}",
  encode = true,
  ...rest
}) {
  if (!service || !request) {
    return undefined;
  }

  const config = {
    request,
    service,
    version,
    layer,
    style,
    tilematrix,
    tilematrixset,
    format,
    tilecol,
    tilerow,
    ...rest,
  };
  const entries = Object.entries(config);
  const upperCasedEntries = entries.map(([ key, value ]) => [
    key.toUpperCase(),
    value,
  ]);
  const upperCasedConfig = Object.fromEntries(upperCasedEntries);

  const params = stringify(upperCasedConfig, { encode, sort: false });

  return `${ url }?${ params }`;
}
