"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl('/chatHub').build();
const userName = document.querySelector('#user-name');
const message = document.querySelector('#message');
const sendButton = document.querySelector('#send-button');
const messageList = document.querySelector('#message-list');
const receiverName = document.querySelector('#receiverName');
const setUserName = document.querySelector('#set-user-name');
const userList = document.querySelector('#user-list');
const errorMessage = document.querySelector('#error-message');
const overlay = document.querySelector('.overlay');
const container = document.querySelector('#container');
const messageTo = document.querySelector("#message-to");
const cancelSelection = document.querySelector("#cancel-selection");
const messageDiv = document.querySelector("#message-div");
const sendArrow = document.querySelector("#send-button i")
var connectionId;
var userExists = false;

sendButton.disabled = true;
connection.start().then(() => {
    sendButton.disabled = false;
    connection.invoke("GetConnectionId").then((id) => {
        connectionId = id;
    });
}).catch((error) => {
    return console.error(error.toString());
});

const SendMessage = () => {
    if (message.value.trim() != "") {
        if (messageTo.textContent == 'All') {
            connection.invoke("SendMessageToAll", userName.value, message.value)
                .then(() => {
                    message.value = "";
                    ArrowState();
                })
                .catch((error) => {
                    return console.error(error.toString());
                });
        }
        else {
            //Private message not working
            connection.invoke("GetActiveUsers").then((list) => {
                for (var user in list) {
                    if (user == messageTo.textContent) {
                        var receiverId = list[user];
                        connection.invoke("SendMessageToUser", userName.value, receiverId, message.value)
                            .then(() => {
                                message.value = "";
                                ArrowState();
                            })
                            .catch((error) => {
                                return console.error(error.toString());
                            });
                        break;
                    }
                }
            });
        }
    }
    message.focus();
}

sendButton.onclick = (event) => {
    SendMessage();
    event.preventDefault();
};

message.addEventListener("keypress", (event) => {
    if (event.code == "Enter") {
        SendMessage();
    }
});

message.addEventListener("input", () => {
    ArrowState();
});

const ArrowState = () => {
    if (message.value.trim() != "") {
        sendArrow.style.color = "#0984e3";
        sendArrow.style.cursor = "pointer";
    }
    else {
        sendArrow.style.color = "gray";
        sendArrow.style.cursor = "auto";
    }
}

connection.on("ReceiveMessage", (userName, message, isPrivate) => {
    DisplayMessage(userName, message, "receive-message", isPrivate);
});

connection.on("SendMessage", (message, isPrivate) => {
    DisplayMessage("You", message, "send-message", isPrivate);
});

const DisplayMessage = (userName, message, className, isPrivate) => {
    var div = document.createElement("div");
    div.classList.add(className);
    if (userName == "You") {
        if (isPrivate) {
            div.innerHTML = `<p>${message}</p><br /><span class="text-secondary">Sent privately to ${messageTo.textContent}</span>`;
        }
        else {
            div.innerHTML = `<p>${message}</p>`;
        }
    }
    else {
        if (isPrivate) {
            div.innerHTML = `<span class="text-secondary">${userName}<i class="fa-solid fa-lock"></i></span><br /><p>${message}</p>`;
        }
        else {
            div.innerHTML = `<span class="text-secondary">${userName}</span><br/ ><p>${message}</p>`;
        }
    }
    messageList.append(div);
    messageDiv.scrollTop = messageDiv.scrollHeight;
};

const SetUserName = () => {
    if (userName.value.trim() != '') {
        if (userName.value.length <= 15) {
            connection.invoke("GetActiveUsers").then((list) => {
                if (Object.keys(list).length === 0) {
                    AddUser();
                    overlay.remove();
                    container.classList.remove('blur');
                    message.focus();
                }
                else {
                    for (var user in list) {
                        if (user == userName.value) {
                            userExists = true;
                            break;
                        }
                    }

                    if (userExists == true) {
                        errorMessage.textContent = "Username already exists";
                    }
                    else {
                        AddUser();
                        overlay.remove();
                        container.classList.remove('blur');
                        message.focus();
                    }
                }
            });
        }
        else {
            errorMessage.textContent = "Username must be less than 15 characters";
        }
    }
    else {
        errorMessage.textContent = "Username cannot be empty";
    }

    userExists = false;
}

userName.addEventListener("keypress", (event) => {
    if (event.code == "Enter") {
        SetUserName();
    }
})

userName.addEventListener("input", () => {
    if (userName.value.trim() != "") {
        setUserName.disabled = false;
        setUserName.style.backgroundColor = "#0984e3";
        setUserName.style.cursor = "pointer";
    }
    else {
        setUserName.disabled = true;
        setUserName.style.backgroundColor = "#333333";
        setUserName.style.cursor = "auto";
    }
});

setUserName.onclick = (event) => {
    SetUserName();
    event.preventDefault();
};

const AddUser = () => {
    connection.invoke("AddUser", userName.value, connectionId)
        .catch((error) => {
            return console.error(error.toString());
        });
}

connection.on("DisplayActiveUsers", (users) => {
    while (userList.hasChildNodes()) {
        userList.removeChild(userList.firstChild);
    }

    for (const key in users) {
        var li = document.createElement("li");
        li.classList.add("user-li");
        if (key == userName.value) {
            li.innerHTML = `<i class="fa-solid fa-user"></i>${key} <span class="text-secondary">(You)</span>`;
            li.style.cursor = "auto";
        }
        else {
            li.innerHTML = `<i class="fa-solid fa-user"></i>${key}`;
        }
        userList.appendChild(li);

        li.onclick = () => {
            if (key != userName.value) {
                messageTo.textContent = `${key}`;
                cancelSelection.style.color = "#d63031";
                cancelSelection.style.cursor = "pointer";
                message.focus();
            }
        };
    }
});

cancelSelection.onclick = () => {
    DisableCancelSelection();
};

connection.on("UserJoined", (userName) => {
    UserStatus(userName, "joined");
});

connection.on("UserLeft", (userName) => {
    UserStatus(userName, "left");
    if (messageTo.textContent == userName) {
        DisableCancelSelection();
    }
});

const DisableCancelSelection = () => {
    messageTo.textContent = "All";
    cancelSelection.style.color = "gray";
    cancelSelection.style.cursor = "auto";
    message.focus();
}

const UserStatus = (userName, userStatus) => {
    var p = document.createElement("p");
    p.classList.add("text-secondary", "text-center");
    p.textContent = `${userName} has ${userStatus} the chat.`;
    messageList.append(p);
    messageDiv.scrollTop = messageDiv.scrollHeight;
};
