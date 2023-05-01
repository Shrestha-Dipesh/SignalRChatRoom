"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl('/chatHub').build();
const userName = document.querySelector('#userName');
const message = document.querySelector('#message');
const sendButton = document.querySelector('#sendButton');
const messageList = document.querySelector('#messagesList');
const connectionId = document.querySelector('#connectionId');
const receiverId = document.querySelector('#receiverId');

sendButton.disabled = true;
connection.start().then(() => {
    sendButton.disabled = false;
    connection.invoke("GetConnectionId").then((id) => {
        console.log(connectionId);
        connectionId.textContent = `Your connection id: ${id}`;
    });
}).catch((error) => {
    return console.error(error.toString());
});

sendButton.onclick = (event) => {
    if (receiverId.value == null || receiverId.value == '') {
        connection.invoke("SendMessageToAll", userName.value, message.value)
            .catch((error) => {
                return console.error(error.toString());
            });
    } else {
        connection.invoke("SendMessageToUser", userName.value, receiverId.value, message.value)
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