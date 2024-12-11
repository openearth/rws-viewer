import { stringify } from "query-string";

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL;

export function buildWmtsLayer ({
  url: rawUrl = defaultUrl,
  id,
  layer,
  workspace,
  styles = "",
  paint = {
    'fill-color': '#0080ff',
    'fill-opacity': 0.5
  },
  time,
  filter,
  version,
})  {
  const url = new URL(rawUrl);
  const searchParamEntries = url.searchParams.entries();
  const searchParamsObject = Object.fromEntries(searchParamEntries);

  const tile = buildWmtsGeoserverUrl({
    request: "GetTile",
    version,
    layer: workspace ? `${ workspace }:${ layer }` : layer,
    style: styles,
    url: url.origin + url.pathname,
    transparent: true,
    encode: false,
    ...(time && { time: time }),
    ...(filter && { cql_filter: filter }),
    ...searchParamsObject,
  });

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
