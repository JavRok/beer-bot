/*
Proof of concept:
A bot that hears for beer offerings, and sends a qr code to the receiver. 

*/

const qrcode = 'https://cdn.glitch.com/760c538b-7d97-49f3-aba7-64ee28ded6dd%2Fqr-sample.png?1554815064983';
let recipient;

module.exports = function(controller) {

    controller.hears([/(beer|:beer:|🍺)[\S\s]*(<@.+>)/], ['direct_mention', 'mention', 'direct_message'], function(bot, message) {

        bot.startConversation(message, function(err, convo) {
          if (message.match && message.match.length > 2) {
            recipient = message.match[2];
            const me = `<@${message.user}>`;            
            
            // Callback functions here for closure
            const callback = answerCallback(
              (reply, convo) => {
                convo.say(getContentAfterYes(recipient));
                // Send a private message to recipient
                // To send a private message, we take user id as channel
                bot.say(getQRForRecipient(me, recipient));                
                convo.next();
              },
              (reply, convo) => {
                convo.say('Too bad');
                convo.next();
              }
            );
            
            convo.ask(getQuestion(recipient), callback);
            
          } else {
            convo.say("You want to send a beer then? You forgot to mention the receiver..");          
          }                 

      });
    });

};



// Generic content blocks for slack
function getQuestion (username) {
  return {
    attachments:[
        {
            title: 'Do you really want to send a refreshing :beer: to ' + username + ' ?',
            callback_id: '1',
            attachment_type: 'default',                    
            actions: [
                {
                    "name":"yes",
                    "text": "Go for it !",
                    "value": "yes",
                    "type": "button",
                },
                {
                    "name":"no",
                    "text": "Nah, maybe later",
                    "value": "no",
                    "type": "button",
                }
            ]
        }
    ]
  }
}

function answerCallback (yesCallback, noCallback) {
  return [
    {
        pattern: "yes",
        callback: yesCallback
    },
    {
        pattern: "no",
        callback: noCallback
    },
    {
        default: true,
        callback: function(reply, convo) {
            // do nothing
        }
    }
  ];
}

function getContentAfterYes (receiver) {
  return {
    attachments:[
        {
          ephemeral: true,
          title: 'Awesome! ' + receiver + ' just received a code like this one for the beer !',
          text: 'Don\'t worry, only you can see this message in this channel',
          callback_id: '2',
          attachment_type: 'default',
          image_url: qrcode,
        }
    ]
  }
}

/*
 * @param {string} sender in format '<@USERID>'
 * @param {string} receiver in format '<@USERID>'
 */
function getQRForRecipient (sender, receiver) {
  return {
    channel: receiver.replace(/[<>@]/g, ''),
    attachments:[
        {
            title: `Holly moly ! You have just received a refreshing :beer: from ${sender}. Just show this QR code at your favorite establishment and enjoy !`,
            callback_id: '3',
            attachment_type: 'default',
            image_url: qrcode,
        }
    ]
  }
}  
            
