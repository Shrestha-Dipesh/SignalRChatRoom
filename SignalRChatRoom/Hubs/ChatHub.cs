using Microsoft.AspNetCore.SignalR;

namespace SignalRChatRoom.Hubs
{
    public class ChatHub : Hub
    {
        private static Dictionary<string, string> activeUsers = new Dictionary<string, string>();

        public async Task SendMessageToAll(string userName, string message)
        {
            await Clients.Caller.SendAsync("SendMessage", message);
            await Clients.Others.SendAsync("ReceiveMessage", userName, message);
        }

        public async Task SendMessageToUser(string userName, string connectionId, string message)
        {
            await Clients.Caller.SendAsync("SendMessage", message);
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", userName, message);
        }

        public async Task AddUser(string userName, string connectionId)
        {
            activeUsers.Add(userName, connectionId);
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

            foreach (var user in activeUsers)
            {
                if (user.Value == connectionId)
                {
                    activeUsers.Remove(user.Key);
                    break;
                }
            }

            await Clients.All.SendAsync("DisplayActiveUsers", activeUsers);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
