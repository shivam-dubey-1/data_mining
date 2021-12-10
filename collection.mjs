var util = require('util');
var needle = require('needle');
var {MongoClient} = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';
async function UpdateDb(dataStr) {
          // Use connect method to connect to the server
	  let date_ob = new Date();           
	  let date = ("0" + date_ob.getDate()).slice(-2);           
	  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);           
	  let today = month + "-" + date           
	  let hours = date_ob.getHours();            
	  let minutes = date_ob.getMinutes();           
	  let seconds = date_ob.getSeconds();           
	  let timestamp = month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
          await client.connect();
          //console.log('Connected successfully to server');
          const db = client.db(dbName);
          const collection = db.collection('TwitterStream');
          var str = dataStr.data.text
          str = str.toLowerCase();
          if (str.split(" ").includes("news")){
          //console.log(str)
          const insertResult = await collection.insertMany([{'id':dataStr.data.id,'timestamp': timestamp, 'data': str, 'url':dataStr.data.entities.urls
        }])}
          // const getres = await
          // the following code examples can be pasted here...

          return 'done.';
        }

function updata(data){
  console.log("---------------------------------------------------------------------------------------------------")
}
async function update_count(date){
	  await client.connect();
	  const db = client.db(dbName);
	  const collection = db.collection('TwitterStream');
	  if (await collection.count({'date': date}, { limit: 1 }) === 1){
		      collection.updateOne({'date': date},{$inc: {'count':1}})
		      console.log(await collection.findOne({'date': date}))
		      
		    }
	  else{
		      collection.insertOne({'date': date,'count':1})
		      console.log(await collection.findOne({'date': date}))
		    }

}



// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = 'Enter-Token';

const streamURL = 'https://api.twitter.com/2/tweets/sample/stream?tweet.fields=entities';

async function streamConnect(retryAttempt) {

  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2SampleStreamJS",
      "Authorization": `Bearer ${token}`
    },
    timeout: 20000
  });

  stream.on('data', data => {
    try {
      const json = JSON.parse(data);
      console.log(json);
      let date_ob = new Date();       
      let date = ("0" + date_ob.getDate()).slice(-2);       
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);       
      let today = month + "-" + date
      update_count(today) 
      UpdateDb(json)
      // A successful connection resets retry count.
      retryAttempt = 0;
    } catch (e) {
      // Catches error in case of 401 unauthorized error status.
      if (data.status === 401) {
        console.log(data);
        process.exit(1);
      } else if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
        console.log(data.detail)
        process.exit(1)
      } else {
        // Keep alive signal received. Do nothing.
      }
    }
  }).on('err', error => {
    if (error.code !== 'ECONNRESET') {
      console.log(error.code);
      process.exit(1);
    } else {
      // This reconnection logic will attempt to reconnect when a disconnection is detected.
      // To avoid rate limits, this logic implements exponential backoff, so the wait time
      // will increase if the client cannot reconnect to the stream. 
      setTimeout(() => { 
        console.warn("A connection error occurred. Reconnecting...")
        streamConnect(++retryAttempt);
      });
    }
    
  });
  return stream;
}

(async () => {
  streamConnect(10000)
})();
