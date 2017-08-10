var fs = require("fs");
var read = require('read');
var login = require("facebook-chat-api");
var config = require('./config.json');

getCreds((email, pass) => {

    var credentials = {email: email, password: pass};

    login(credentials, {forceLogin: true}, (err, api) => {
        if(err) {
            switch (err.error) {
                case 'login-approval':
                    console.log('Enter code > ');
                    rl.on('line', (line) => {
                        err.continue(line);
                        rl.close();
                    });
                    break;
                default:
                    console.error(err);
            }
            return;
        }
        console.log("Successfully Logged In");
        if (api.getAppState()) {
            fs.writeFileSync(config.path.tmp + 'appstate.json', JSON.stringify(api.getAppState()));
        }
    });

})

function getCreds(cb) {
    read({ prompt: 'Email: '}, function(err, id) {
        read({ prompt: 'Password: '}, function(err, pass) {
            return cb(id,pass);
        })
    })
}