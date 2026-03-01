# Game Server Dashboard

## TODO

If there are no servers, display in the dashboard that there's none.

Add the settings modal (For deleting the modal, editing things about it like name, ram usage, cpu limits, backups, etc.)

Add a way to set the port for the server so we can have 2 servers running at once

Server card doesnt have default "extra info", it expects the server to have a version and player count.

In the minecraft provider, add a fetch for server.properties, and change the player count to fetch max-players there. This will also allow us to change its motd.

---

## Project Overview

The goal of this project is to allow for easily creatable multiplayer game servers by only needing a docker container for the game. The framework is a modular, Docker-centric management layer built with a Node.js backend and a React frontend.

- **Automated Discovery**: Monitors the `/servers` directory and Docker socket for automatic registration.
- **Protocol Translation**: Uses the **Provider Pattern** to map generic containers to game-specific logic (RCON, Query, etc.).
- **Persistence & State**: Maintains a **Single Source of Truth (SSOT)** via `server_config.json`.
- **Dynamic UI Rendering**: Utilizes a **Factory Pattern** to inject specialized React components based on `gameType`.

---

## UI Components

### Dashboard & Navigation

The main interface features a side navigation bar and a dynamic header. The header includes a **[+ New Server]** button that triggers the creation workflow.

1. **Server Dashboard**: Overview of all managed containers.
2. **System Information**: Host-level telemetry (CPU, RAM, Disk) with 24-hour trends.
3. **Logs**: Unified access to system and container-level output.
4. **Global Settings**: Bulk power actions and system-wide configurations.
5. **File Manager**: Integrated `monaco-editor` for direct configuration editing.

### Server Card & Statistics

- **Dynamic Layouts**: Statistics modals use a factory to render specific widgets (e.g., Minecraft TPS).
- **Fallback Mechanism**: If no specific layout exists, the system defaults to hardware-only metrics.

---

## Game Providers (Backend)

Providers act as translators between raw container data and the standardized JSON format used by the UI.

### Specific Game Providers

Each provider must implement the `GameStatsProvider` interface:

- `ping()`: Readiness check.
- `getAllStats()`: Metric aggregation.
- `getVersion()` / `playerCount()`: Identity and activity metadata.

---

## Game Components (Frontend)

The visual layer determines how raw data and creation requirements are presented.

### Base Components (The Factory)

`BaseComponents` serves as the orchestrator for:

1. **Component Lookup**: Mapping `gameType` to specific renderers.
2. **Creation Requirements**: Generating the necessary forms for a new server.
3. **UI Helpers**: Providing standardized methods like `createDropdown` to maintain visual parity.

### Architecture: The Unified Folder Pattern

Each game type is moving toward a self-contained folder within the architecture:

- **Manifest**: Defines the available versions, types (Forge, Fabric, etc.), and default ports.
- **Icon**: The game-specific branding retrieved via `BaseComponent`.
- **Requirements**: A functional mapping of the manifest to UI components (e.g., mapping the `versions` array to a `Dropdown`).

---

## Services

### Server Service

Communicates with the **Docker socket** to manage states and sync container data with Game Providers.

### System Service

Monitors host-level hardware, essential for resource-constrained environments like a **Raspberry Pi**.

### Data Service

Handles persistence via `Config.ts`, managing the `server_config.json` database which stores identity, custom layouts, and cached states.

## Creating a Server

In order to actually join some servers, there is a little configuration on your side that needs to happen. You will need to setup port forwarding on your router based on the game, and also the system you are hosting the server on has to open the port on its firewall settings to allow access.

### Minecraft

For Java, Minecraft requires the **25565 (TCP)** port to be open, and for Bedrock is requires the **19132 (UDP)** port

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
