# valvas-publication-producer
Producer service providing an endpoint to fetch Valvas publications since a specific timestamp.

## Tutorials
### Add the service to a stack
Add the service to your `docker-compose.yml`:

```
  valvas-publication-producer:
    image: kanselarij/valvas-publication-producer

```

Add the following dispatcher rules in `./config/dispatcher/dispatcher.ex` to make the endpoint to list publication files available for the consuming service.

```elixir
  get "/publications/*path" do
    Proxy.forward conn, path, "http://publication-producer/files/"
  end
```

The service assumes a [file service](https://github.com/mu-semtech/file-service) hosting the publication files is already available in the stack for the consumer to download the publication files.

Restart the updated service
```
docker-compose restart dispatcher
```

Create the newly added service
```
docker-compose up -d
```

## Reference
### API
#### GET /files?since=<datetime>
Get a list of publication files generated since the request timestamp. The list is ordered by creation date, oldest first. This is also the order in which the files must be consumed.

Example response:
```json
{
  "data": [
    {
      "type": "files",
      "id": "3be63fd0-c030-11ea-a482-b30a6eeb477f",
      "attributes": {
        "name": "delta-2020-07-07T08:59:58.409Z.json",
        "created": "2020-07-07T08:59:58.413Z"
      }
    },
    {
      "type": "files",
      "id": "3fd04b40-c030-11ea-a482-b30a6eeb477f",
      "attributes": {
        "name": "delta-2020-07-07T09:00:04.977Z.json",
        "created": "2020-07-07T09:00:04.980Z"
      }
    }
  ]
}
```


