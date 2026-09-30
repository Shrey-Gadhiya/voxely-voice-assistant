const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { exec } = require('child_process');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws/voice-agent' });

const PORT = process.env.PORT || 3001;
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || '';

app.use(cors());
app.use(express.json());

// In-memory action log
const activityLog = [
  { id: 'act_1', time: '10:32 AM', action: 'YouTube opened', tool: 'open_website', status: 'Completed', url: 'https://www.youtube.com' },
  { id: 'act_2', time: '10:34 AM', action: 'YouTube searched: Python automation', tool: 'youtube_search', status: 'Completed', url: 'https://www.youtube.com/results?search_query=Python%20automation' },
  { id: 'act_3', time: '10:36 AM', action: 'Google searched: AssemblyAI Voice Agent API', tool: 'web_search', status: 'Completed', url: 'https://www.google.com/search?q=AssemblyAI%20Voice%20Agent%20API' },
  { id: 'act_4', time: '10:40 AM', action: "Weather checked: Surat (32°C, Sunny and Warm)", tool: 'get_weather', status: 'Completed' }
];

// Context memory for multi-turn commands
let sessionContext = {
  lastSearchTool: 'youtube_search',
  lastSearchQuery: 'Python automation',
  lastUrl: 'https://www.youtube.com/results?search_query=Python%20automation'
};

// 1. Status endpoint
app.get('/api/status', (req, res) => {
  const isConfigured = Boolean(ASSEMBLYAI_API_KEY && ASSEMBLYAI_API_KEY.trim() !== '');
  res.json({
    status: 'ok',
    configured: isConfigured,
    mode: isConfigured ? 'live' : 'demo',
    model: 'Universal-3 Pro Realtime',
    provider: 'AssemblyAI Voice Agent API',
    version: '3.0.0'
  });
});

// 2. Server-side temporary token endpoint for AssemblyAI Voice Agent
app.get('/api/voice-token', async (req, res) => {
  const isConfigured = Boolean(ASSEMBLYAI_API_KEY && ASSEMBLYAI_API_KEY.trim() !== '');

  if (!isConfigured) {
    return res.json({
      success: true,
      mode: 'demo',
      token: null,
      wssUrl: 'ws://' + req.headers.host + '/ws/voice-agent',
      message: 'Running in Local Demo Mode. No ASSEMBLYAI_API_KEY configured in .env.'
    });
  }

  try {
    const tokenResponse = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ expires_in: 3600 })
    });

    if (tokenResponse.ok) {
      const data = await tokenResponse.json();
      return res.json({
        success: true,
        mode: 'live',
        token: data.token,
        wssUrl: 'wss://agents.assemblyai.com/v1/ws',
        model: 'u3-rt-pro'
      });
    } else {
      const errorText = await tokenResponse.text();
      return res.status(tokenResponse.status).json({
        success: false,
        mode: 'demo',
        error: `AssemblyAI Token Failed: ${errorText}`
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      mode: 'demo',
      error: `Could not connect to AssemblyAI API: ${err.message}`
    });
  }
});

// 3. Activity Log Endpoint
app.get('/api/activity', (req, res) => {
  res.json({ activities: activityLog });
});

app.post('/api/activity', (req, res) => {
  const { action, tool, status = 'Completed', url } = req.body;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const entry = {
    id: `act_${Date.now()}`,
    time,
    action,
    tool,
    status,
    url
  };
  activityLog.unshift(entry);
  if (activityLog.length > 40) activityLog.pop();
  res.json({ success: true, entry });
});

// Helper for known website shortcuts
function resolveUrl(raw) {
  const str = (raw || '').toLowerCase().trim();
  const sites = {
    'youtube': 'https://www.youtube.com',
    'google': 'https://www.google.com',
    'github': 'https://github.com',
    'gmail': 'https://mail.google.com',
    'instagram': 'https://www.instagram.com',
    'twitter': 'https://x.com',
    'x': 'https://x.com',
    'reddit': 'https://www.reddit.com',
    'linkedin': 'https://www.linkedin.com',
    'amazon': 'https://www.amazon.com',
    'chatgpt': 'https://chatgpt.com',
    'assemblyai': 'https://www.assemblyai.com'
  };

  for (const [key, dest] of Object.entries(sites)) {
    if (str.includes(key)) return dest;
  }
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  if (str.includes('.')) return `https://${str}`;
  return `https://www.${str}.com`;
}

// 4. Secure Tool Execution Endpoint
app.post('/api/tools/execute', (req, res) => {
  const { toolName, parameters = {}, userConfirmed = false } = req.body;
  console.log(`[Tool Engine] ${toolName}:`, parameters);

  // Safety Gate: require confirmation for sensitive actions
  const sensitiveTools = ['send_email', 'send_message', 'delete_file', 'purchase', 'submit_form', 'execute_shell'];
  if (sensitiveTools.includes(toolName) && !userConfirmed) {
    return res.json({
      status: 'confirmation_required',
      requires_confirmation: true,
      tool: toolName,
      prompt: `Do you want me to continue?`,
      parameters
    });
  }

  try {
    switch (toolName) {
      case 'open_website': {
        const dest = resolveUrl(parameters.url);
        sessionContext.lastUrl = dest;
        return res.json({
          status: 'success',
          tool: 'open_website',
          actionType: 'browser_open',
          url: dest,
          spokenResponse: `Opening ${parameters.url || 'website'}.`,
          displayAction: `${parameters.url || 'Website'} opened`
        });
      }

      case 'web_search': {
        const q = (parameters.query || '').trim();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
        sessionContext.lastSearchTool = 'web_search';
        sessionContext.lastSearchQuery = q;
        sessionContext.lastUrl = searchUrl;
        return res.json({
          status: 'success',
          tool: 'web_search',
          actionType: 'browser_open',
          url: searchUrl,
          spokenResponse: `Searching Google for ${q}.`,
          displayAction: `Google searched: ${q}`
        });
      }

      case 'youtube_search': {
        const q = (parameters.query || '').trim();
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        sessionContext.lastSearchTool = 'youtube_search';
        sessionContext.lastSearchQuery = q;
        sessionContext.lastUrl = youtubeUrl;
        return res.json({
          status: 'success',
          tool: 'youtube_search',
          actionType: 'browser_open',
          url: youtubeUrl,
          spokenResponse: `Done. I searched YouTube for ${q}.`,
          displayAction: `YouTube searched: ${q}`
        });
      }

      case 'get_weather': {
        const location = parameters.location || 'Surat';
        const weatherPresets = {
          'surat': { temp: '32°C (90°F)', condition: 'Sunny and Warm', humidity: '64%' },
          'ahmedabad': { temp: '34°C (93°F)', condition: 'Clear Skies', humidity: '48%' },
          'mumbai': { temp: '30°C (86°F)', condition: 'Partly Cloudy with Coastal Breeze', humidity: '76%' },
          'delhi': { temp: '28°C (82°F)', condition: 'Hazy Sun', humidity: '52%' },
          'san francisco': { temp: '19°C (66°F)', condition: 'Mild and Sunny', humidity: '58%' },
          'new york': { temp: '21°C (70°F)', condition: 'Mostly Sunny', humidity: '50%' }
        };
        const locKey = location.toLowerCase().trim();
        const data = weatherPresets[locKey] || { temp: '26°C (79°F)', condition: 'Clear and pleasant', humidity: '55%' };
        const msg = `The weather in ${location} is ${data.temp}, ${data.condition}.`;
        return res.json({
          status: 'success',
          tool: 'get_weather',
          spokenResponse: msg,
          displayAction: `Weather checked: ${location} (${data.temp}, ${data.condition})`,
          result: { location, ...data }
        });
      }

      case 'get_current_time': {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        const msg = `It is currently ${timeStr} on ${dateStr}.`;
        return res.json({
          status: 'success',
          tool: 'get_current_time',
          spokenResponse: msg,
          displayAction: `Time checked: ${timeStr}`,
          result: { time: timeStr, date: dateStr }
        });
      }

      case 'open_application': {
        const appName = (parameters.application || '').toLowerCase().trim();
        let launchedName = 'Application';
        if (appName.includes('calc')) {
          exec('calc', () => {});
          launchedName = 'Calculator';
        } else if (appName.includes('notepad')) {
          exec('notepad', () => {});
          launchedName = 'Notepad';
        } else if (appName.includes('code') || appName.includes('vscode')) {
          exec('code .', () => {});
          launchedName = 'VS Code';
        } else {
          launchedName = parameters.application;
        }

        return res.json({
          status: 'success',
          tool: 'open_application',
          spokenResponse: `Opening ${launchedName}.`,
          displayAction: `${launchedName} launched`,
          result: { application: launchedName }
        });
      }

      case 'browser_back': {
        return res.json({
          status: 'success',
          tool: 'browser_back',
          actionType: 'browser_back',
          spokenResponse: 'Going back.',
          displayAction: 'Browser navigated back'
        });
      }

      case 'browser_forward': {
        return res.json({
          status: 'success',
          tool: 'browser_forward',
          actionType: 'browser_forward',
          spokenResponse: 'Going forward.',
          displayAction: 'Browser navigated forward'
        });
      }

      case 'browser_refresh': {
        return res.json({
          status: 'success',
          tool: 'browser_refresh',
          actionType: 'browser_refresh',
          spokenResponse: 'Refreshing the page.',
          displayAction: 'Browser refreshed'
        });
      }

      case 'create_reminder': {
        const title = parameters.title || 'Reminder';
        const datetime = parameters.datetime || '8:00 PM';
        return res.json({
          status: 'success',
          tool: 'create_reminder',
          spokenResponse: `I've set a reminder for "${title}" at ${datetime}.`,
          displayAction: `Reminder set: "${title}" at ${datetime}`,
          result: { title, datetime }
        });
      }

      default:
        return res.status(400).json({ status: 'error', message: `Unknown tool: ${toolName}` });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. Smart Natural Intent Classifier & Tool Router
function classifyIntent(rawText) {
  const text = (rawText || '').trim().toLowerCase();

  // Smart Context: "open the first one" or "open the first result"
  if (text.includes('first one') || text.includes('first result') || text.includes('open that') || text.includes('open it')) {
    return {
      toolName: 'open_website',
      parameters: { url: sessionContext.lastUrl || 'https://www.youtube.com' },
      spokenReply: 'Opening the first result.'
    };
  }

  // Browser Navigation: back, forward, refresh
  if (text === 'go back' || text === 'back' || text === 'browser back') {
    return { toolName: 'browser_back', parameters: {}, spokenReply: 'Going back.' };
  }
  if (text === 'go forward' || text === 'forward' || text === 'browser forward') {
    return { toolName: 'browser_forward', parameters: {}, spokenReply: 'Going forward.' };
  }
  if (text === 'refresh this page' || text === 'refresh' || text === 'reload' || text === 'reload this page') {
    return { toolName: 'browser_refresh', parameters: {}, spokenReply: 'Refreshing this page.' };
  }

  // YouTube search specifically
  if (
    (text.includes('youtube') && (text.includes('search') || text.includes('find') || text.includes('look for') || text.includes('tutorials') || text.includes('video'))) ||
    text.startsWith('search youtube for ') || text.startsWith('search youtube ') || text.includes('on youtube')
  ) {
    let q = text
      .replace(/^(hey voxely,?|voxely,?)?\s*/i, '')
      .replace(/search youtube for|search youtube|search on youtube|find react tutorials on youtube|find on youtube|on youtube|youtube for|youtube/gi, '')
      .trim();
    if (!q && text.includes('react')) q = 'React tutorials';
    if (!q && text.includes('python')) q = 'Python automation tutorials';
    if (!q) q = 'Python tutorials';

    return {
      toolName: 'youtube_search',
      parameters: { query: q },
      spokenReply: `Sure, searching YouTube for ${q}.`
    };
  }

  // Open Direct Sites: YouTube, GitHub, Gmail, Instagram, etc.
  if (
    text === 'open youtube' || text === 'take me to youtube' || text === 'go to youtube' || text === 'launch youtube' ||
    text.startsWith('open ') || text.startsWith('take me to ') || text.startsWith('go to ') || text.startsWith('launch ')
  ) {
    let site = text.replace(/^(hey voxely,?|voxely,?)?\s*(open|take me to|go to|launch)\s+/i, '').trim();

    // Check application first
    if (site.includes('vs code') || site.includes('vscode') || site.includes('code') || site.includes('calculator') || site.includes('notepad')) {
      const app = site.includes('code') ? 'VS Code' : site.includes('calc') ? 'Calculator' : 'Notepad';
      return {
        toolName: 'open_application',
        parameters: { application: app },
        spokenReply: `Opening ${app}.`
      };
    }

    if (site === 'github') return { toolName: 'open_website', parameters: { url: 'https://github.com' }, spokenReply: "I've opened GitHub." };
    if (site === 'gmail') return { toolName: 'open_website', parameters: { url: 'https://mail.google.com' }, spokenReply: 'Opening Gmail.' };
    if (site === 'instagram') return { toolName: 'open_website', parameters: { url: 'https://www.instagram.com' }, spokenReply: 'Opening Instagram.' };
    if (site === 'youtube') return { toolName: 'open_website', parameters: { url: 'https://www.youtube.com' }, spokenReply: 'Opening YouTube.' };

    return {
      toolName: 'open_website',
      parameters: { url: site },
      spokenReply: `Opening ${site}.`
    };
  }

  // Weather query
  if (text.includes('weather') || text.includes('temperature') || text.includes('forecast')) {
    let loc = 'Surat';
    if (text.includes('in ')) {
      loc = text.split('in ')[1].replace(/[?!.]/g, '').trim();
    }
    return {
      toolName: 'get_weather',
      parameters: { location: loc || 'Surat' },
      spokenReply: `Checking the weather in ${loc || 'Surat'}.`
    };
  }

  // Time query
  if (text.includes('what time is it') || text.includes("what's the time") || text.includes('tell me the current time') || text.includes('time')) {
    return {
      toolName: 'get_current_time',
      parameters: { timezone: 'Asia/Kolkata' },
      spokenReply: 'Checking the current time.'
    };
  }

  // Reminders
  if (text.includes('reminder') || text.includes('remind me')) {
    let datetime = '8:00 PM';
    if (text.includes('8 pm') || text.includes('8:00 pm')) datetime = '8:00 PM';
    return {
      toolName: 'create_reminder',
      parameters: { title: 'Personal task', datetime },
      spokenReply: `Setting a reminder for ${datetime}.`
    };
  }

  // Web search (Google)
  if (
    text.startsWith('search google for ') || text.startsWith('search the web for ') ||
    text.startsWith('search for ') || text.startsWith('look up ') || text.startsWith('google ')
  ) {
    const q = text.replace(/^(search google for|search the web for|search for|look up|google)\s+/i, '').trim();
    return {
      toolName: 'web_search',
      parameters: { query: q },
      spokenReply: `Searching Google for ${q}.`
    };
  }

  // Fallback to web search
  return {
    toolName: 'web_search',
    parameters: { query: rawText },
    spokenReply: `Looking up "${rawText}".`
  };
}

// 6. Router Endpoint for UI & Voice
app.post('/api/agent/route', (req, res) => {
  const { input } = req.body;
  const decision = classifyIntent(input);
  res.json({
    success: true,
    input,
    ...decision
  });
});

// WebSocket Server
wss.on('connection', (ws) => {
  const isLive = Boolean(ASSEMBLYAI_API_KEY && ASSEMBLYAI_API_KEY.trim() !== '');
  console.log(`[WS] Client connected. Mode: ${isLive ? 'LIVE' : 'DEMO'}`);

  ws.send(JSON.stringify({
    type: 'session.ready',
    mode: isLive ? 'live' : 'demo',
    model: 'Universal-3 Pro Realtime',
    system_prompt: 'You are Voxely, a fast and helpful voice-controlled personal assistant.'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'transcript.user') {
        const decision = classifyIntent(data.text);
        ws.send(JSON.stringify({ type: 'reply.started', timestamp: Date.now() }));
        if (decision.toolName) {
          ws.send(JSON.stringify({
            type: 'tool.call',
            call_id: `call_${Date.now()}`,
            name: decision.toolName,
            parameters: decision.parameters
          }));
        }
        ws.send(JSON.stringify({
          type: 'transcript.agent',
          text: decision.spokenReply,
          action: decision.toolName,
          parameters: decision.parameters
        }));
        ws.send(JSON.stringify({ type: 'reply.done', timestamp: Date.now() }));
      }
    } catch (e) {}
  });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Voxely Single-Page Voice Assistant Server on port ${PORT}`);
  console.log(` Engine: AssemblyAI Universal-3 Pro Voice Agent API`);
  console.log(` Mode: ${ASSEMBLYAI_API_KEY ? 'LIVE (Key Loaded)' : 'DEMO MODE (No API Key found)'}`);
  console.log(`======================================================\n`);
});
