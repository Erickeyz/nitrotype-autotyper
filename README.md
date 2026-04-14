# ⚡ NitroType AutoTyper

A highly accurate, anti-cheat bypassing AutoTyper for NitroType.com. 

This extension uses Chrome's Debugger API to simulate hardware-level keystrokes, allowing it to bypass modern React-based anti-cheat systems. It features absolute time-syncing for perfect WPM accuracy and a customizable humanized typo rate.

## ✨ Features
* **High Accuracy WPM:** Set speeds up to 500 WPM. Uses absolute time-syncing to ensure the exact speed is maintained without browser lag.
* **Humanized Typos:** Adjustable error rate slider that introduces random, realistic typos.
* **Hardware Keystrokes:** Uses the Chrome Debugger API to send `isTrusted: true` keystrokes, completely bypassing NitroType's synthetic event blockers.
* **Iframe Support:** Automatically detects and injects into NitroType's embedded race iframes.

---

## 🛠️ How to Install

Because this extension uses the powerful Debugger API, it is not available on the Chrome Web Store. You must install it manually using Developer Mode.

### Step 1: Download the Code
1. Click the green **`<> Code`** button at the top right of this repository.
2. Click **`Download ZIP`**.
3. Extract (unzip) the downloaded folder to a location on your computer (like your Desktop or Documents folder).

### Step 2: Install in Chrome
1. Open Google Chrome and type `chrome://extensions/` into the URL bar and press Enter.
2. In the top right corner, turn on the **Developer mode** toggle switch.
3. In the top left corner, click the **Load unpacked** button.
4. Select the extracted folder from Step 1 (make sure you select the folder that contains the `manifest.json` file).

### Step 3: How to Use
1. Pin the AutoTyper extension to your Chrome toolbar for easy access.
2. Go to [NitroType.com](https://www.nitrotype.com) and enter a race.
3. Once the race countdown begins (or the text appears), click the extension icon.
4. Set your desired WPM and Typo Rate.
5. Click **Start**.

> **Note:** When the AutoTyper starts, Chrome will display a yellow banner at the top of your screen saying *"NitroType AutoTyper started debugging this browser."* **This is completely normal and required for the bot to work.** Do not click "Cancel" on this banner while racing, or the typing will stop.

---

## ⚠️ Disclaimer
This tool is for educational purposes only. Using bots or auto-typers on NitroType violates their Terms of Service and may result in your account being banned. Use at your own risk.

## 📄 License
This project is licensed under the GNU GPLv3 License.
