export default function (layerName, json) {
  const rows = json[0]
  const properties = Object.keys(rows)

  let htmlRows = properties
    .map((property) => {
      return `<tr>
                <td style="font-weight:bold; width: 50%; overflow-wrap: break-word; vertical-align: top;"> ${ property }:</td>
                <td style="width: 50%; overflow-wrap: break-word; vertical-align: top;"> ${ rows[property] }</td>
            </tr>`
    })
    .join('')

  //build the table
  const table = `
  <p style="font-weight:bold; text-align:center;">${ layerName }</p>
	<table style="table-layout: fixed; width: 100%;">
		<tbody>
			${ htmlRows }
		<tbody>
	<table>`

  return table
}
