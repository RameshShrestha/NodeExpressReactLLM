import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

function HelpDialog({ open, onClose }) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                className: "rounded-2xl"
            }}
        >
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
                <span className="text-xl font-bold">📚 How to Use Ollama Local LLM UI</span>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    className="text-white hover:bg-blue-800"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent className="mt-4">
                {/* Getting Started */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    🚀 Getting Started
                </Typography>
                <Typography variant="body2" className="mb-4 text-gray-700">
                    Welcome to your local LLM interface! This application allows you to interact with Ollama AI models directly from your browser.
                </Typography>
                <Divider className="mb-4" />

                {/* Sidebar Controls */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    ⚙️ Sidebar Controls
                </Typography>
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                    <li><strong>Select Model:</strong> Choose from available Ollama models (e.g., llama2, mistral, etc.)</li>
                    <li><strong>Select Voice:</strong> Pick a voice for text-to-speech responses</li>
                    <li><strong>Use Streaming Response:</strong> Enable real-time streaming of AI responses</li>
                    <li><strong>Read Response Automatically:</strong> Auto-play voice responses</li>
                    <li><strong>Add New Chat:</strong> Create a new conversation thread</li>
                    <li><strong>Settings:</strong> Access additional configuration options</li>
                </ul>
                <Divider className="mb-4" />

                {/* Chat Management */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    💬 Chat Management
                </Typography>
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                    <li><strong>Search Chats:</strong> Use the search bar to find specific conversations</li>
                    <li><strong>Select Chat:</strong> Click on any chat to view its history</li>
                    <li><strong>Delete Chat:</strong> Click the trash icon to remove a conversation</li>
                    <li><strong>Chat Timestamps:</strong> See when each conversation was created</li>
                </ul>
                <Divider className="mb-4" />

                {/* Sending Messages */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    ✉️ Sending Messages
                </Typography>
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                    <li><strong>Type Message:</strong> Enter your prompt in the textarea at the bottom</li>
                    <li><strong>Send:</strong> Press Enter or click the send button (✈️ icon)</li>
                    <li><strong>Shift+Enter:</strong> Add a new line without sending</li>
                    <li><strong>Attachments:</strong> Click the attachment button to add files or URLs</li>
                </ul>
                <Divider className="mb-4" />

                {/* Action Buttons */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    🎯 Action Buttons
                </Typography>
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                    <li><strong>📎 Attachment:</strong> Add files or web URLs to your message</li>
                    <li><strong>🎤 Microphone:</strong> Use voice input for your message</li>
                    <li><strong>✈️ Send:</strong> Submit your message to the AI</li>
                    <li><strong>📢 Speak:</strong> Read the last AI response aloud</li>
                    <li><strong>🔇 Stop:</strong> Stop the current voice playback</li>
                    <li><strong>🗑️ Clear:</strong> Delete all messages in current chat</li>
                    <li><strong>⚙️ System Message:</strong> Set custom system instructions</li>
                </ul>
                <Divider className="mb-4" />

                {/* Tips & Tricks */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    💡 Tips & Tricks
                </Typography>
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                    <li>Use vision-capable models (like llava) for image analysis</li>
                    <li>Enable streaming for faster response feedback</li>
                    <li>Set system messages to customize AI behavior</li>
                    <li>Attach documents for context-aware responses</li>
                    <li>Use voice input for hands-free interaction</li>
                </ul>
                <Divider className="mb-4" />

                {/* Keyboard Shortcuts */}
                <Typography variant="h6" className="font-bold text-blue-700 mb-2">
                    ⌨️ Keyboard Shortcuts
                </Typography>
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                    <li><strong>Enter:</strong> Send message</li>
                    <li><strong>Shift + Enter:</strong> New line in message</li>
                </ul>

            </DialogContent>
            
            <DialogActions className="p-4 bg-gray-50">
                <Button 
                    onClick={onClose} 
                    variant="contained"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Got it!
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default HelpDialog;

// Made with Bob