import { app, errorHandler } from 'mu';
import { querySudo as query } from '@lblod/mu-auth-sudo';

app.get('/files', async function( req, res ) {
  const since = req.query.since || new Date().toISOString();
  const files = await getDeltaFiles(since);
  res.json({ data: files });
} );

/**
 * Get all delta files produced by the ttl-to-delta service since a given timestamp
 *
 * @param since {string} ISO date time
 * @private
 */
async function getDeltaFiles(since) {
  console.log(`Retrieving delta files since ${since}`);
  const result = await query(`
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?uuid ?filename ?created
    WHERE {
      ?s a nfo:FileDataObject ;
        mu:uuid ?uuid ;
        nfo:fileName ?filename ;
        dct:creator <http://redpencil.data.gift/services/ttl-to-delta-service> ;
        dct:created ?created .
      ?file nie:dataSource ?s .

      FILTER (?created > "${since}"^^xsd:dateTime)
    } ORDER BY ?created
  `);

  return result.results.bindings.map(b => {
    return {
      type: 'files',
      id: b['uuid'].value,
      attributes: {
        name: b['filename'].value,
        created: b['created'].value
      }
    };
  });
}

app.use(errorHandler);
