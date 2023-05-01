"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl('/chatHub').build();
const userName = document.querySelector('#userName');
const message = document.querySelector('#message');
const sendButton = document.querySelector('#sendButton');
const messageList = document.querySelector('#messagesList');
const receiverName = document.querySelector('#receiverName');
const setUserName = document.querySelector('#setUserName');
var connectionId;

sendButton.disabled = true;
connection.start().then(() => {
    sendButton.disabled = false;
    connection.invoke("GetConnectionId").then((id) => {
        connectionId = id;
    });
}).catch((error) => {
    return console.error(error.toString());
});

sendButton.onclick = (event) => {
    if (receiverName.value == null || receiverName.value == '') {
        connection.invoke("SendMessageToAll", userName.value, message.value)
            .catch((error) => {
                return console.error(error.toString());
            });
    } else {
        connection.invoke("GetActiveUsers").then((list) => {
            if (list != null || list.count > 0) {
                for (var user in list) {
                    if (user == receiverName.value) {
                        var receiverId = list[user];
                        connection.invoke("SendMessageToUser", userName.value, receiverId, message.value)
                            .catch((error) => {
                                return console.error(error.toString());
                            });
                        break;
                    }
                }
            }
        });
        
    }
    event.preventDefault();
};

setUserName.onclick = (event) => {
    if (userName.value.trim() != '') {
        userName.disabled = true;
        setUserName.remove();
        connection.invoke("AddUser", userName.value, connectionId)
            .catch((error) => {
                return console.error(error.toString());
            });
    }
    event.preventDefault();
};

connection.on("ReceiveMessage", (userName, message) => {
    DisplayMessage(userName, message);
});

connection.on("SendMessage", (message) => {
    DisplayMessage("You", message);
});

const DisplayMessage = (userName, message) => {
    var li = document.createElement("li");
    li.textContent = `${userName}: ${message}`;
    messageList.append(li);
};