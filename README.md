# facebook-messenger-scraper

Download all facebook messages from a group chat to a mongoDB database and save all images locally.

> :warning: August 2021 Update: Facebook has changed its API since this script was made.  You can now download your messages [by following the instructions here](https://www.maketecheasier.com/download-facebook-chat-history/).

## Prerequisites

Before running, set up a mongo database.  [mLab](https://mlab.com/) offers free hosted databases for up to 500 MB.  Set your `MONGO_URL` environment variable equal to the connection string.

Facebook's Graph API does not have a way to retreive messages using an facebook developer access token.  Instead, you need to log in to facebook in your browser, open up the group chat you wish to scrape, and inspect a sample network request using chrome's developer tools.  Then, set the following environment variables based on the information you find in the `Request Headers` and `Form Data` sections:

- `REFERER`
- `COOKIE`
- `DYN`
- `PC`
- `SPIN_B`
- `SPIN_R`
- `SPIN_T`
- `USER`
- `FB_DTSG`
- `JAZEOEST`
- `DOC_ID`
- `QUERY_ID`
- `STARTING_TIMESTAMP`

## Usage

```
npm i
node index.js
```

## Output

Pictures will be saved to the `./pictures` directory.  The name of the file will be the timestamp in milliseconds that the picture was first sent, eg. `1514782800000.jpg` for a picture sent Jan 1, 2018.
