# Game Server Dashboard

## Project Overview

The goal of this project is to allow for easily creatable multiplayer game servers by only needing a docker compose file for the game. The framework is a modular, Docker-centric management layer built with a Node.js backend and a React frontend.

> An image of the current look of the server dashboard, with servers of different game types displayed:
<img width="1918" height="957" alt="image" src="https://github.com/user-attachments/assets/79436236-e823-400a-9021-eff669452b10" />
<br>
> An image displaying the ease of creating a new game server with a user-friendly interface:
<img width="611" height="606" alt="image" src="https://github.com/user-attachments/assets/2b2688d5-eafd-4f43-95c6-0b8919abd5c4" />

**_*At the current moment, this project is aimed to work with ARM64 architecture (Such as a Raspberry pi). Future implementations will include x86_64, since lots of game servers are not designed for ARM64.*_**

Currently, this project supports Minecraft and Satisfactory server deployments. While the system was originally architected for Minecraft, the recent addition of Satisfactory demonstrates the modular design of the platform. New game servers can be integrated easily by simply dropping in a standard Docker template, which can usually be found by looking online.

- **Automated Discovery**: Monitors the `/servers` directory and Docker socket for an automatic server display.
- **Protocol Translation**: Uses the **Provider Pattern** to map generic containers to game-specific logic (RCON, Query, etc.).
- **Persistence & State**: Maintains a **Single Source of Truth (SSOT)** architecture via `server_config.json`.
- **Dynamic UI Rendering**: Utilizes a **Factory Pattern** to inject specialized React components based on a `gameType`.

## Running the Program

Since this project is a Full-Stack application designed to manage Docker containers, you need to ensure your environment is prepared before starting the development server.

### 1. Prerequisites

Ensure you have the following installed on your Raspberry Pi:

- **Node.js** (v18 or higher recommended)
- **npm**
- **Docker** and **Docker Compose**
- **Git**

### 2. Installation

Clone the repository and install the necessary dependencies for both the frontend and backend:

```bash
# Clone the repository
git clone [https://github.com/username/repo-name.git](https://github.com/username/repo-name.git)
cd "Game Server Dashboard/pi-server"

# Install all dependencies
npm install
```

We also need to create a .env file in `pi-server` so that our system knows what path to take:

```bash
# Create and edit the .env file
nano .env

# Make sure to edit the <path-to-repo>
SERVERS_PATH="<path-to-repo>/Game Server Dashboard/servers"
SCRIPTS_PATH="<path-to-repo>/Game Server Dashboard/scripts"
PORT=3001
```

You will also need to add your ip address to the ServiceConstants so your backend can connect with the front end.

```bash
# In src/services/ServiceConstants.ts, change this line
export const API_BASE_URL = "http://<IP-ADDRESS>:3001"; // Change this to your own IP
```

Ensure that the program has sufficient permissions to run everything:

```bash
sudo usermod -aG docker $USER
```

After doing all of this, starting both the frontend and backend needs one command:

```bash
npm run start:all
```

> **Ensure that you read the [Creating a Server](#creating-a-server) section to enable your ports. You will be unable to join any game server until these network rules are correctly configured.**

After running these commands, you just need to go to website using port 5173:
`<ip-address>:5173`

## UI Components

### Dashboard & Navigation

The main interface features a side navigation bar and a dynamic header. The header includes a **[+ New Server]** button that triggers the creation workflow.

1. **Server Dashboard**: Overview of all managed containers.
2. **System Information**: Host-level telemetry (CPU, RAM, Disk) with 24-hour trends. (Not yet implemented)
3. **Logs**: Unified access to system/container level outputs and errors. (Not yet implemented)
4. **Global Settings**: Bulk power actions (such as mass restart or mass turn off) and system-wide configurations. (Not yet implemented)
5. **File Manager**: A file manager inside the application that allows for easy modifying or downloading of server files. (Not yet implemented)

### Server Card & Statistics

- **Dynamic Layouts**: Statistics modals use a factory to render specific widgets (e.g., Minecraft TPS).
- **Fallback Mechanism**: If no specific layout exists, the system defaults to hardware-only metrics received from the docker container it runs on.

## Game Providers

A **Game Provider** acts as a specialized "translator" for the dashboard. While Docker can only report if a container is "online" or "offline," a Provider reaches inside the game's specific files or logs to extract live data like player counts or world progress.

### The BaseProvider

The **BaseProvider** serves as the central access point and "router" for all services in the program. Instead of services needing to know about every individual game type, they call the BaseProvider. It coordinates the request by communicating with the **ProviderRegistry** to fetch the specific provider instance required for the task. This ensures that the rest of the application has a single, consistent way to interact with any game server.

### The ProviderRegistry

The **ProviderRegistry** is the storage hub for the system’s modularity. it maintains a mapped collection of all available game types and their corresponding provider classes. When the BaseProvider needs to perform an action for a specific game (like Minecraft or Satisfactory), the Registry provides the correct instance, allowing the system to remain flexible and easily expandable.

### Specific Game Providers

Since every game stores data differently, each requires a specific provider to extract and standardize its statistics (like player counts or world tiers). While these data-gathering functions are optional, implementing them allows the UI to display live, game-specific information beyond basic "Online/Offline" status.

Each provider must implement the `GameProvider` interface:

- `ping()`: Readiness check. Used to see if the server is "starting" or "stopping". If not implemented, it should default to `true`
- `getAllStats()`: Metric aggregation. Used to display custom stats that the user wants to see. For example, Minecraft servers display ticks per second, entity counts, etc.
- `getVersion()` / `playerCount()`: Identity and activity metadata. This data is used to display on the server card. The version can also be the map type (Such as ARK being different types of maps). If there is no version or specific map, you can simply return `Latest Version`.

### Game Components (Frontend)

The visual layer determines how raw data and creation requirements are presented to the user.

## Game Components

A **Game Component** is the specific UI "skin" for a game. While the backend provides the data, the component decides how to display it. For example, a Minecraft component might show a list of logged-in players, while a Satisfactory component displays the current Milestone or Phase.

### The BaseComponent

The **BaseComponent** serves as the primary interface for the frontend. Much like the BaseProvider on the backend, it acts as the "router" for all UI services. When a service or a modal needs to display a specific game's interface, it calls the Base Component and passes in a `gameType`. The Base Component then coordinates with the **ComponentRegistry** to retrieve the correct visual module.

### The ComponentRegistry

The **ComponentRegistry** is the frontend's central repository. It stores and manages the collection of all available **Game Components**. When the Base Component requests a specific game type (like Minecraft or Satisfactory), the Registry provides the corresponding class and its manifest. This allows the frontend to dynamically load different server interfaces instantly without a page reload.

## Adding a New Game

Currently, adding a new game requires a manual process to link the backend logic with the frontend UI. Follow these steps to integrate a new game server:

1. **Define the Game Type**: Add your new game to the `GAME_TYPE` array in `GameTypes.ts`. This string acts as the unique identifier across the entire application.
2. **Register the Modules**: Add the game to both the `ProviderRegistry` (Backend) and the `ComponentRegistry` (Frontend). This allows the Base classes to "find" your game when requested.
3. **Create the Game Directory**: Create a new folder inside `games/`. Within this folder, you must create:
   - A **Provider Class** (implementing the interface `GameProvider`)
   - A **Component Class** (implementing the interface `GameComponent`)
4. **Prepare the Docker Template**: Add a `<game-name-here>.yml` file for the game into the `templates/` folder. Ensure the file uses variables for `CONTAINER_NAME` and `RAM` so the dashboard can inject these values dynamically.
5. **Implement Logic (Optional)**:
   - While returning default values will allow the server to "work," you can populate your Provider and Component code to return live statistics (like player counts or world progress) for a more interactive experience.
   - Add a icon.png to the games folder in order to add a logo for the game server.

## Services

### Server Service

Communicates with the **Docker socket** to manage states and sync container data with Game Providers.

### System Service

Monitors host-level hardware, essential for resource-constrained environments like a **Raspberry Pi**.

### Data Service

Handles persistence via `Config.ts`, managing the `server_config.json` database which stores identity, custom layouts, and cached states.

## Creating a Server

In order to actually join some servers, there is a little configuration on your side that needs to happen. You will need to setup port forwarding on your router based on the game, and also the system you are hosting the server on has to open the port on its firewall settings to allow access (Universal Firewall is great).

### Minecraft

For Java, Minecraft requires the **25565 (TCP)** port to be open, and for Bedrock is requires the **19132 (UDP)** port

Also ensure that you have downloaded java on the system running the server or it won't run correctly.

### Satisfactory

Satisfactory requires **7777 (TCP/UDP)** and **8888 (TCP)** ports to be open.

In addition to this, if the system is running on **ARM64** (such as a Raspberry Pi 5), you must change the kernel page size to **4KB**. Most x86-based games and their emulators are not compatible with the 16KB page size that comes standard on newer Pi OS versions.

#### Kernel Configuration Steps

1. **Open the boot configuration file:**
   ```bash
   sudo nano /boot/firmware/config.txt
   ```
2. **Add this line at the bottom of the file:**
   ```bash
   kernel=kernel8.img
   ```
3. **Reboot the system:**
   ```bash
   sudo reboot
   ```
4. **Verify the page size changed to 4096:**
   ```
   getconf PAGESIZE
   ```

## Future Implementation and Bug Fixes

If there are no servers, there should be text saying "No servers".

Adding functionality to the settings modal.

Add a way to set the port for the server so we can have 2 servers running at once

In the minecraft provider, add a fetch for server.properties, and change the player count to fetch max-players there. This will also allow us to change its motd and other server properties inside the settings modal when its implemented.

---
