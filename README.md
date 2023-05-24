# SignalRChatRoom

>## Prerequisites
1. .NET Core 7.0 or above
2. Visual Studio 2022 (plus ASP.NET components)
\
&nbsp;
>## Getting Started
1. Go to the desired directory and run the following command in Git Bash:
```bash
git clone https://github.com/Shrestha-Dipesh/SignalRChatRoom.git
```

2. Run the solution and copy the URL from the address bar, open another browser instance or tab, and paste the URL in the address bar.
\
&nbsp;
>## Running the app on different devices
1. Make sure that the devices are connected to the same network.

2. Find the IPv4 address of the host device by running the following command in Command Prompt:
```bash
ipconfig
```

3. Open Properties/launchSettings.json and replace the localhost in applicationUrl of the desired profile with the host IP address:

&emsp;For http:
```bash
"applicationUrl": "http://{IPAddress}:{PortNumber}"
```
&emsp;For https:
```bash
"applicationUrl": "https://{IPAddress}:{PortNumber};http://{IPAddress}:{PortNumber}"
```
