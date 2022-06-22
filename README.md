# Token List API
The Token List API is an API that will consume the generated UTL and expose endpoints for efficient querying and searching.
It will include endpoints where you can input a list of mint addresses, and receive data of those mints in one request, search endpoints etc without needing to pull the whole token list client-side. The goal of this API is to be very performant and to not require clients to download the whole token list.


```
GET /v1/list
GET /v1/search?query=slrs&limit=1
POST /v1/mints
```
