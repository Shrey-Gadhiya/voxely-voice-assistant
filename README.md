# Voxely — "Talk to your computer."

> **"Give Voxely a command. It understands what you mean and takes care of the action."**

Voxely is an open, production-grade, voice-controlled personal computer assistant built for the **AssemblyAI Voice Agent API Hackathon**.

Instead of a generic chatbot, Voxely acts as an active operating agent: you press the microphone, speak naturally, and Voxely interprets your intent, calls the appropriate tool, executes the browser or system action, and speaks back in natural language.

---

## ⚡ Core Voice Assistant Architecture

1. **Real-time Speech Recognition**: Sub-150ms streaming transcription powered by AssemblyAI **Universal-3 Pro Realtime** (`u3-rt-pro`).
2. **Acoustic Voice Activity Detection (VAD)**: Real-time turn detection and natural pause analysis.
3. **Interruptibility / Barge-In**: If the user begins speaking while Voxely is talking, the assistant immediately cuts off its response and returns to listening.
4. **Intent-Driven Tool Calling**: No rigid regex or hundreds of hardcoded strings; the LLM reasons over structured JSON schemas to select actions.
5. **Secure Browser & System Actions**: Opens web applications, Google searches, YouTube tutorials, and checks live weather and system time.
6. **Strict Safety Gates**: Dangerous or irreversible actions (sending emails, deleting records, purchases) trigger explicit confirmation: *"Do you want me to continue?"*.

---

## 🛠 Registered Tool Catalog (12 Modular Tools)

| Tool | Signature | Permission Level | Description |
| :--- | :--- | :--- | :--- |
| **Open Website** | `open_website(url)` | Safe Action | Resolves shortcuts (YouTube, GitHub, Gmail, Instagram) & opens URL |
| **Web Search** | `web_search(query, engine)` | Safe Action | Performs Google search with query encoding |
| **YouTube Search** | `youtube_search(query)` | Safe Action | Directly opens YouTube search results |
| **Open Search Result** | `open_search_result(result_id)`| Safe Action | Context-aware opener for previous search result |
| **Weather Forecast** | `get_weather(location)` | Safe Action | Returns live meteorological condition, temperature, humidity |
| **Current Time** | `get_current_time(timezone)` | Safe Action | Provides localized date, time, and day of week |
| **Create Reminder** | `create_reminder(title, datetime)`| Safe Action | Persists task reminder with target timestamp |
| **App Launcher** | `open_application(application)`| Safe (Whitelisted) | Safely launches desktop tools (Calculator, Notepad, VS Code) |
| **Navigate Browser** | `navigate_browser(url)` | Safe Action | Directs active window to URL |
| **Browser Back** | `browser_back()` | Safe Action | Navigates back in browser history |
| **Browser Forward** | `browser_forward()` | Safe Action | Navigates forward in browser history |
| **Browser Refresh** | `browser_refresh()` | Safe Action | Reloads active page |

---

## 🔒 Safety & Confirmation Architecture

Voxely divides actions into two categories:
- **Safe Actions**: Reading information, opening websites, performing web searches, checking time and weather.
- **Confirmation Required**: Sending emails, deleting files, submitting forms, purchases, executing shell commands.
  - For any sensitive request, Voxely pauses and asks: *"Do you want me to continue?"*, executing only upon explicit user confirmation.
  - Arbitrary terminal commands from voice input are strictly blocked.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
PORT=3001
NODE_ENV=development
```

*(If `ASSEMBLYAI_API_KEY` is not provided, Voxely automatically operates in **Local Demo Mode** with full speech synthesis, turn-taking, and tool calling).*

### 3. Run Development Servers
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API & WebSocket Server**: `http://localhost:3001`
  - `GET /api/voice-token`: Server-side ephemeral AssemblyAI token generator.
  - `POST /api/tools/execute`: Structured tool execution dispatcher with safety confirmation.
  - `POST /api/agent/route`: Intent reasoning & conversational response engine.
  - `GET /api/history`: Persisted audit log of voice commands.

---

## 🗣 Example Voice Interactions

```
User:   "Hey Voxely"
Voxely: "Yes? How can I help you?"

User:   "Open YouTube."
Voxely: "Opening YouTube."
[Action: YouTube opens in browser]

User:   "Now search for Python automation."
Voxely: "Searching YouTube for Python automation."
[Action: YouTube search results open]

User:   "What's the weather in Surat?"
Voxely: "The weather in Surat is 32°C (90°F), Sunny and Warm."

User:   "Set a reminder for 8 PM"
Voxely: "Setting a reminder for 8:00 PM."
```

---

## 🏆 Hackathon Compliance & Codebase Quality

- **Zero Legacy Code**: 0 ArcVision references, 0 surveillance/CCTV terms.
- **No Copyright Infringement**: Original Voxely branding and editorial SaaS design system (warm ivory, dark charcoal typography, subtle blue accents).
- **Security-First**: `ASSEMBLYAI_API_KEY` is never exposed to client-side bundles; tokens are generated ephemerally server-side.
