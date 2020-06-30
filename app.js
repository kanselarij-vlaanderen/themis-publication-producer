import { app, errorHandler } from 'mu';
import { sparqlEscapeUri, sparqlEscapeDateTime, query } from 'mu';

const ttlToDeltaUri = 'http://redpencil.data.gift/services/ttl-do-delta-service';

app.get('/files', async function( req, res ) {
  const since = req.query.since || new Date().toISOString();
  const files = await getDeltaFiles(since);
  res.json({ data: files });
} );


async function getDeltaFiles(since) {
  const queryString = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

    SELECT ?logicalFileUri
    WHERE
    {
      ?physicalFile nie:dataSource ?logicalFileUri.
      ?logicalFileUri a nfo:FileDataObject;
        dct:created ?date;
        dct:creator ${sparqlEscapeUri(ttlToDeltaUri)}.
      FILTER (?date > ${sparqlEscapeDateTime(since)})
    }
    ORDER BY ASC(?date)
  `;
  const result = await query(queryString);
  return result.results.bindings.map((result) => result.logicalFileUri.value);
}

app.use(errorHandler);
