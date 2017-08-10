const fs = require('fs-extra');
const fb = require("facebook-chat-api");
const config = require('./config.json');
const escapeJSON = require('escape-json-node');

var timestamp = undefined;
var messageDefaultCount = 50, messageCount = undefined;


login();

function login() {

    fb({appState: JSON.parse(fs.readFileSync(config.path.tmp + 'appstate.json', 'utf8'))}, (err, api) => {

        //Error Handling
        if(err) return console.error(err);

        //Set options
        api.setOptions({
            listenEvents: true,
            selfListen: true
        });

        //Start Listening for chats
        listen(api);

        //Backup old chats
        // api.getThreadList(0, 1, 'inbox', (err, arr) => {

        //     arr.forEach(function(thread){
        //         getAllMessages(api, thread)
        //     });
        // })

    });

}

function getAllMessages(api, thread) {
    loadNextThreadHistory(api,thread.threadID)
}


function loadNextThreadHistory(api, threadID){
    api.getThreadHistory(threadID, messageDefaultCount, timestamp, (err, history) => {
        if(err) return console.error(err);

        messageCount = Object.keys(history).length;
        if(timestamp != undefined) history.pop();
        timestamp = history[0].timestamp;

        history.reverse().forEach(function(message){

        })

        if (messageCount >= messageDefaultCount) {
            loadNextThreadHistory(api,threadID);
        }

    });
}

function listen(api) {
    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);

        // api.markAsRead(event.threadID, (err) => {
        //     if(err) console.error(err);
        // });

        // console.log(event.body);
        console.log(event);
        switch(event.type) {
            case "message":

                datpath = config.path.data + api.getCurrentUserID();
                ensureExists(datpath, 0744, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        filepath = datpath + '/' + event.threadID + '.json';
                        fs.ensureFileSync(filepath)
                        var data = fs.readFileSync(filepath, 'utf8');
                        // console.log(data);
                        var json = JSON.parse(data);
                        json.push(event);
                        fs.writeFileSync(filepath, JSON.stringify(json), 'utf8');
                    }
                });

                if(event.body === '/ciao-adios') {
                    api.sendMessage("Goodbye…", event.threadID);
                    return stopListening();
                }
                // api.sendMessage("TEST BOT: " + event.body, event.threadID);

                break;
            case "event":
                // console.log(event);
                break;
        }
    });
}

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

            // switch(message.type) {
            //     case 'message':
                    
            //         var attachments = message.attachments;
            //         if (Object.keys(attachments).length != 0) {
            //             attachments.forEach(function(attachment){

            //                 switch(attachment.type) {
            //                     case 'photo':
            //                         console.log('[photo] ' + message.senderName + ': ' + attachment.largePreviewUrl);
            //                         break;
            //                     case 'sticker':
            //                         console.log('[sticker] ' + message.senderName + ': ' + attachment.url);
            //                         break;
            //                     default:
            //                         console.log(attachment);
            //                 }

            //             })
            //         } else {
            //             console.log('[message] ' + message.senderName + ': ' + message.body);
            //         }

            //         break;
            //     case 'event':
            //         console.log('[event] ' + message.senderName + ': ' + message.logMessageType);
            //         break;
            //     default:
            //         console.log(message);
            // }