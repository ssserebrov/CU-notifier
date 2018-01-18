var request=require('request');
var token;
var chatID;

exports.init = function (inToken, inChatID) {
	token = inToken;
	chatID = inChatID;
}

exports.sendMessage = function (msg) {
    if (msg === undefined) {
        return;
    }
    msg = msg.replace("+", "%2B");
    url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatID}&text=${msg}`;

	request(url, { json: true }, (err, res, body) => {
	if (err) { return console.log(err); }
	});
}