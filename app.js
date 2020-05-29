import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';
import { sparqlEscapeUri, sparqlEscapeDateTime, query } from 'mu';


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const ttlToDeltaUri = 'http://redpencil.data.gift/services/ttl-do-delta-service';

app.post('/files', async (req, res) => {
  const since = new Date(req.body.since);
  const files = await getFilesSince(since);
  res.json(files);
})

async function getFilesSince(since) {
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

app.get('/test', async (req, res) => {
  res.send('Hello World');
});

app.use(errorHandler);
