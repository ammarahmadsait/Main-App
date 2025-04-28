import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { config, aiPersonality } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Host configuration
const HOST = 'localhost';  // Changed to localhost only
const PORT = process.env.PORT || 5000;
const PUBLIC_URL = `http://localhost:${PORT}`; // Simplified for local use

console.log('[Mr. White] Server initializing...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

console.log('[Mr. White] Middleware initialized');

// API Routes
app.post('/api/connect', async (req, res) => {
    console.log('[Mr. White] Connection request received');
    try {
        const { model } = req.body;
        console.log(`[Mr. White] Connecting to Ollama with model: ${model}`);
        
        // Check if Ollama is running
        console.log('[Mr. White] Verifying Ollama status...');
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            console.error('[Mr. White] Ollama service not available');
            throw new Error('Ollama is not running');
        }
        
        console.log('[Mr. White] Connection established');
        res.json({ success: true, model });
    } catch (error) {
        console.error('[Mr. White] Connection error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    console.log('[Mr. White] Chat request received');
    try {
        const { model, messages } = req.body;
        
        // Add system message if it's not already present
        const fullMessages = messages[0]?.role === 'system' 
            ? messages 
            : [aiPersonality.systemMessage, ...messages];
        
        console.log(`[Mr. White] Processing chat with model: ${model}`);
        console.log(`[Mr. White] Message count: ${fullMessages.length}`);
        
        // Log the last user message
        const lastUserMessage = messages[messages.length - 1];
        console.log('[Mr. White] User message:', lastUserMessage.content);
        
        console.log('[Mr. White] Sending request to Ollama API...');
        const response = await fetch(`${config.OLLAMA_API}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: fullMessages,
                stream: false
            })
        });
        
        if (!response.ok) {
            console.error(`[Mr. White] API Error: ${response.status}`);
            throw new Error(`Ollama API Error: ${response.status}`);
        }
        
        console.log('[Mr. White] Response received');
        const data = await response.json();
        
        // Log the AI response
        console.log('[Mr. White] AI Response:', data.message.content);
        
        res.json(data);
    } catch (error) {
        console.error('[Mr. White] Chat error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`[Mr. White] Server running on http://${HOST}:${PORT}`);
    console.log(`[Mr. White] Public URL: ${PUBLIC_URL}`);
    console.log('[Mr. White] Serving static files from:', path.join(__dirname, '../public'));
});

const DEFAULT_MODEL = 'ALIENTELLIGENCE/cybersecuritythreatanalysisv2';
const DEFAULT_OLLAMA_PATH = 'C:\\Users\\Goodwill\\AppData\\Local\\Programs\\ollama\\ollama.exe';


