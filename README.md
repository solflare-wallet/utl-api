# <p align="center"><a href="https://solflare.com/"><img src="https://solflare.com/assets/logo-icon.26659b6d..svg" height="100" alt="Solflare"></a>

# Unified Token List API

The Token List API is an API that will consume the generated UTL and expose endpoints for efficient querying and searching.
It will include endpoints where you can input a list of mint addresses, and receive data of those mints in one request, search endpoints etc without needing to pull the whole token list client-side. The goal of this API is to be very performant and to not require clients to download the whole token list.


## Setup
Implemented as a simple Express.JS API, only a connection to MongoDB database is required.

**API service**

```shell
docker build -t utl-api -f _docker/api.Dockerfile .
docker run --env DB_URL="mongodb://user:pass@localhost/utl" --env NODE_ENV=production -p 8080:80 utl-api
```


**CRON service**

Used to peridically sync with published token list on CDN. `CRON_SYNC` defines frequency of sync cron job.

```shell
docker build -t utl-api-cron -f _docker/cron.Dockerfile .
docker run --env DB_URL="mongodb://user:pass@localhost/utl" --CDN_URL="https://cdn.jsdelivr.net/gh/solflare-wallet/token-list@latest/solana-tokenlist.json" --env NODE_ENV=production --env CRON_SYNC="0 */10 * * * *" utl-api-cron
```




## Endpoints

### List all

Used to list all tokens.

**URL** : `/v1/list` or `/v1/list&chainId=103`

**Method** : `GET`

**Response**

```json
{
    "content": [
      {
        "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "chainId": 101,
        "name": "USD Coin",
        "symbol": "USDC",
        "verified": true,
        "decimals": 6,
        "holders": 100000,
        "logoURI": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
        "tags": []
      },
      {
        "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "chainId": 101,
        "name": "Raydium",
        "symbol": "RAY",
        "verified": true,
        "decimals": 6,
        "holders": 100000,
        "logoURI": "https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg?1612875614",
        "tags": []
      },
  ]
}
```


### Search by content

Used to search tokens by name/symbol. You can use `start` and `limit` for pagination.

**URL** : `/v1/search?query=slrs&start=0&limit` or `/v1/search?query=slrs&start=0&limit&chainId=101`

**Method** : `GET`

**Response**

```json
{
    "content": [
      {
        "address": "SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr",
        "chainId": 101,
        "name": "Solrise Finance",
        "symbol": "SLRS",
        "verified": true,
        "decimals": 6,
        "holders": 40604,
        "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr/logo.png",
        "tags": []
      },
      {
        "address": "GtFtWCcLYtWQT8NLRwEfUqc9sgVnq4SbuSnMCpwcutNk",
        "chainId": 101,
        "name": "tuSLRS",
        "symbol": "tuSLRS",
        "verified": true,
        "decimals": 6,
        "holders": 1117,
        "logoURI": "https://raw.githubusercontent.com/sol-farm/token-logos/main/tuSLRS.png",
        "tags": [
          "tulip-protocol",
          "lending",
          "collateral-tokens"
        ]
      }
  ]
}
```




### Get by mints

Used to get all tokens from array of mint addresses.

**URL** : `/v1/mints` or `/v1/mints&chainId=101`

**Method** : `POST`

**Request**
```json
{
    "addresses": [
      {
        "address": "SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr",
        "chainId": 101,
        "name": "Solrise Finance",
        "symbol": "SLRS",
        "verified": true,
        "decimals": 6,
        "holders": 40604,
        "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr/logo.png",
        "tags": []
      },
      {
        "address": "GtFtWCcLYtWQT8NLRwEfUqc9sgVnq4SbuSnMCpwcutNk",
        "chainId": 101,
        "name": "tuSLRS",
        "symbol": "tuSLRS",
        "verified": true,
        "decimals": 6,
        "holders": 1117,
        "logoURI": "https://raw.githubusercontent.com/sol-farm/token-logos/main/tuSLRS.png",
        "tags": [
          "tulip-protocol",
          "lending",
          "collateral-tokens"
        ]
      }
  ]
}
```

**Response**

```json
{
    "content": [
      {
        "address": "SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr",
        "chainId": 101,
        "name": "Solrise Finance",
        "symbol": "SLRS",
        "verified": true,
        "decimals": 6,
        "holders": 40604,
        "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr/logo.png",
        "tags": []
      },
      {
        "address": "GtFtWCcLYtWQT8NLRwEfUqc9sgVnq4SbuSnMCpwcutNk",
        "chainId": 101,
        "name": "tuSLRS",
        "symbol": "tuSLRS",
        "verified": true,
        "decimals": 6,
        "holders": 1117,
        "logoURI": "https://raw.githubusercontent.com/sol-farm/token-logos/main/tuSLRS.png",
        "tags": [
          "tulip-protocol",
          "lending",
          "collateral-tokens"
        ]
      }
  ]
}
```



## Related repos
- [Token List Aggregator](https://github.com/solflare-wallet/utl-aggregator)
- [Token List API](https://github.com/solflare-wallet/utl-api)
- [Token List SDK](https://github.com/solflare-wallet/utl-sdk)
- [Solfare Token List](https://github.com/solflare-wallet/token-list)
