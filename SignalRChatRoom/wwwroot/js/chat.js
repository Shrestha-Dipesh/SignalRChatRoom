"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl('/chatHub').build();
const userName = document.querySelector('#userName');
const message = document.querySelector('#message');
const sendButton = document.querySelector('#sendButton');
const messageList = document.querySelector('#messagesList');

sendButton.disabled = true;
connection.start().then(() => {
    sendButton.disabled = false;
}).catch((error) => {
    return console.error(error.toString());
});

sendButton.onclick = (event) => {
    connection.invoke("SendMessageToAll", userName.value, message.value)
        .catch((error) => {
            return console.error(error.toString());
        });
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