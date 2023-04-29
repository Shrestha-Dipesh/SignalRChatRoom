using Microsoft.AspNetCore.SignalR;

namespace SignalRChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessageToAll(string userName, string message)
        {
            await Clients.Caller.SendAsync("SendMessage", message);
            await Clients.Others.SendAsync("ReceiveMessage", userName, message);
        }
    }
}
