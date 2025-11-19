# Simple Ad Server

Upload image/video ads and serve them randomly via an API.

## Endpoints

### POST /upload
Upload ads (multipart form):
- adfile (file)
- advertiser (string)

### GET /serve
Returns a random ad.

### /ads/{filename}
Serves uploaded media.
