let express = require('express')
let { MongoClient } = require("mongodb")
let mongodb = require('mongodb')
let deviceId = require("browser-id")
let app = express()
let db

let port = process.env.PORT
if (port == null || port == ""){
  port = 3000
}

app.use(express.static(__dirname + '/public'))

let connectionString = 'mongodb+srv://todoAppUser:cherish12@cluster0.kzgsk.mongodb.net/todoApp?retryWrites=true&w=majority'
MongoClient.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true} , function(err, client) {
    db = client.db()
    app.listen(port)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

//function passwordProtected(req, res, next) {
//    res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"')
//   console.log(req.headers.authorization)
//    if (req.headers.authorization == "Placeholder") {
//        next()
//    }else {
//        res.status(401).send('Authentication required')
//    }
// }

app.get('/', function(req, res) {
  let deviceId = browserID()  
  db.collection('items').find({ deviceId: deviceId }).toArray(function(err, items) {
    res.send(`<!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
  <link rel="stylesheet" href="/CSS/style.css">
  </head>
  <body>
  <div class="container">
  <h1 class="display-4 text-center py-1">To-Do App!</h1>
  
  <div class="jumbotron p-3 shadow-sm">
  <form id="create-form" action="/create-item" method="POST">
  <div class="d-flex align-items-center">
  <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
  <button class="btn btn-primary">Add New Item</button>
  </div>
  </form>
  </div>
  
  <ul id="item-list" class="list-group pb-5">
  </ul>
  
  </div>

  <script>
  let items = ${JSON.stringify(items)}
  </script>
  
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="/browser.js"></script>
  </body>
  </html>`)
  })
})

app.post('/create-item', function(req, res) {
  db.collection('items').insertOne({text: req.body.text}, function(err, info) {
    if(err) {
        console.log('Error occured while inserting')
    }else {
        let data = {
            "_id": info.insertedId,
            "text": req.body.text
        }
    res.json(data)
    }
  })
})

app.post('/update-item', function(req, res) {
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: req.body.text}}, function() {
    res.send("Success")
  })
})

app.post('/delete-item', function(req, res) {
    db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function() {
        res.send("Success")
    })
})
