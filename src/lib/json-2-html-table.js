export default function (layerName, json) {
  const rows = json[0]
  const properties = Object.keys(rows)

  let htmlRows = properties
    .map((property) => {
      return `<tr>
                <td style="font-weight:bold; width: 33%; overflow-wrap: break-word; vertical-align: top;"> ${ property }:</td>
                <td style="width: 67%; overflow-wrap: break-word; vertical-align: top;"> ${ rows[property] }</td>
            </tr>`
    })
    .join('')

  //build the table
  const table = `
  <p style="position: fixed; top: 0; left: 0; height: 20px; width: inherit; font-weight:bold; text-align:center; background-color: white;">${ layerName }</p>
	<table style="table-layout: fixed; margin-top: 20px; width: 100%;">
		<tbody>
			${ htmlRows }
		<tbody>
	<table>`

  return table
}
