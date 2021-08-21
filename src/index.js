const https = require('https');
const querystring = require('querystring');
const request = require('request');
const download = require('image-downloader');
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL,
{
  reconnectTries: 5,
  reconnectInterval: 1000,
  keepAlive: 1,
  useMongoClient: true,
}, function(err, db){

  const {Message} = require('./models/message');

  function scrapeMessages(_timestamp){
  let documents_arr = [];

  let options = {
    'Origin': 'https://mobile.facebook.com',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Response-Format': 'JSONStream',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36',
    'Accept': '*/*',
    'Referer': process.env.REFERER,
    'Accept-Language': 'en-US,en;q=0.8' ,
    'Cookie': process.env.COOKIE
  };


  let next_timestamp = _timestamp;

  var post_data = querystring.stringify({
    '__a': '1',
    '__be': '1',
    '__dyn': process.env.DYN,
    '__pc': process.env.PC,
    '__spin_b': process.env.SPIN_B,
    '__spin_r': process.env.SPIN_R,
    '__spin_t': process.env.SPIN_T,
    '__user': process.env.USER,
    'batch_name': 'MessengerGraphQLThreadFetcher',
    'fb_dtsg': process.env.FB_DTSG,
    'jazoest': process.env.JAZEOEST,
    'queries': `{\"o0\":{\"doc_id\":\"${process.env.DOC_ID}\",\"query_params\":{\"id\":\"${process.env.QUERY_ID}\",\"message_limit\":200,\"load_messages\":1,\"load_read_receipts\":true,\"before\":' + _timestamp + '}}}`
  });

  request.post({
    url: 'https://www.facebook.com/api/graphqlbatch/',
    headers: options,
    body: post_data,
    method: 'POST'
  }, function(err, res, body){

    let messages = res.body.toString();
    const last = messages.indexOf('\"successful_results')
    messages = JSON.parse(messages.substring(0, last - 7))
    messages = messages['o0']['data']['message_thread']['messages']['nodes']

    messages.forEach(function(message){
      if (message.__typename === 'UserMessage') {
        msg_text = message.message.text;
        timestamp = message.timestamp_precise
        if (timestamp < next_timestamp) {
          next_timestamp = timestamp;
        }
        name = message.message_sender.id
        if (name === process.env.USER_ID_1) {
          name = process.env.USER_NAME_1
        }else if (name === process.env.USER_ID_2){
          name = process.env.USER_NAME_2
        }else if (name === process.env.USER_ID_3){
          name = process.env.USER_NAME_3
        }else{
          name = process.env.USER_NAME_4
        }
        if (message.blob_attachments.length > 0) {
          const picturesOptions = {};
          const hasAttachment = true;
          if (message.blob_attachments[0].large_preview) {
              picturesOptions = {
              url: message.blob_attachments[0].large_preview.uri,
              dest: `./pictures/${timestamp}.jpg`  // Save to /path/to/dest/image.jpg
            }
          }else if(message.blob_attachments[0].preview_image){
              picturesOptions = {
              url: message.blob_attachments[0].preview_image.uri,
              dest: `./pictures/${timestamp}.jpg`  // Save to /path/to/dest/image.jpg
            }       
          }else{
            msg_text = message.blob_attachments[0].playable_url
          }
          download.image(picturesOptions)
            .then(({ filename, image }) => {
              console.log('File saved to', filename)
            }).catch((err) => {
              throw err
            })
        }else{
          hasAttachment = false;
        }
        documents_arr.push(
        {name: name,
         text: msg_text,
         has_attachment: hasAttachment,
         timestamp: timestamp
        });
      }
    });

    Message.collection.insert(documents_arr,
     function(err, docs){
        console.log(docs.insertedCount)
      });

    scrapeMessages(next_timestamp - 1);
  });
}

  scrapeMessages(process.env.STARTING_TIMESTAMP);
});

