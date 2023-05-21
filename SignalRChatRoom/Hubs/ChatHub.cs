using Microsoft.AspNetCore.SignalR;

namespace SignalRChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly Dictionary<string, string> activeUsers = new();

        public async Task SendMessageToAll(string userName, string message)
        {
            bool isPrivate = false;
            await Clients.Caller.SendAsync("SendMessage", message, isPrivate);
            await Clients.Others.SendAsync("ReceiveMessage", userName, message, isPrivate);
        }

        public async Task SendMessageToUser(string userName, string connectionId, string message)
        {
            bool isPrivate = true;
            await Clients.Caller.SendAsync("SendMessage", message, isPrivate);
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", userName, message, isPrivate);
        }

        public async Task AddUser(string userName, string connectionId)
        {
            activeUsers.Add(userName, connectionId);
            await Clients.All.SendAsync("UserJoined", userName);
            await Clients.All.SendAsync("DisplayActiveUsers", activeUsers);
        }

        public Dictionary<string, string> GetActiveUsers()
        {
            return activeUsers;
        }

        public string GetConnectionId()
        {
            return Context.ConnectionId;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = GetConnectionId();
            var userName = "";

            foreach (var user in activeUsers)
            {
                if (user.Value == connectionId)
                {
                    userName = user.Key;
                    activeUsers.Remove(user.Key);
                    break;
                }
            }

            await Clients.All.SendAsync("UserLeft", userName);
            await Clients.All.SendAsync("DisplayActiveUsers", activeUsers);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
