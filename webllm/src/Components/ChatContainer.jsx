import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import AssistantIcon from '@mui/icons-material/Assistant';
import { LocalStorage } from "../Dataprovider/LocalStorage.js";
import { useEffect, useState, useCallback } from 'react'

const _myLocalStorageUtility = LocalStorage();


export default function ChatContainer( {selectedChatId} ) {
    const [chatList, setChatList] = useState([]);

    const fetchChatsHistory = async(chatId) => {
        try {
            const response = await fetch('/dataprovider/chathistory/' + chatId + "/chatItem");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const chatList = await response.json();
            setChatList(chatList);
            console.log("chatList", chatList);
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
            setChatList([]); // Clear list on error
        }
    }
    const handleSubmit = async (oEvent) => {
        const modelName = selectedModel; //document.getElementById('modelName').value;
        const prompt = document.getElementById('prompt').value;
        const systemPrompt = systemMessage; //document.getElementById('systemPrompt').value;
        const stream = streamResponse;
        setBusy(true);
        // Generate text
        if (modelName && prompt && systemPrompt && !stream) {
            fetch('/dataprovider/getLLMResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelName, prompt, systemPrompt, chatHistory, stream,selectedChatId })
            }).then(response => response.json())
                .then(async data => {
                    setBusy(false);
                    const parser = new DOMParser();
                    // Parse the string into a new document
                    const doc = parser.parseFromString(data.llmresponse, 'text/html');
                //    document.getElementById('output').innerHTML = doc.body.innerHTML;
                  //  setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: doc.body.innerHTML }]);
                  //  _myLocalStorageUtility.setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: doc.body.innerHTML }]);
                 
                  if(readResponse){
                        document.getElementById('speak-btn').click();
                    }

                    if(!selectedChatId){
                    setChats([...chats, {_id:data.selectedChatId,title: prompt, createdAt: new Date()}]);  
                       setSelectedChatId(data.selectedChatId);
                    }else{

                    }
                    document.getElementById('prompt').value = '';
                    
                })
                .catch(error => {
                       setBusy(false);
                    console.error('Error generating text:', error);
                });
        } else if (modelName && prompt && systemPrompt && stream) {
            const parser = new DOMParser();
            const response = await fetch('/dataprovider/getLLMResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelName, prompt, systemPrompt, chatHistory, stream,selectedChatId })
            });
               setBusy(false);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedHtml = ''
            //  const doc = parser.parseFromString(data.llmresponse, 'text/html');
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('Stream complete');
                    break;
                }
                const chunk = decoder.decode(value);

                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        accumulatedHtml += data.content;
                        console.log(data); // Update your UI here
                        const tempDoc = parser.parseFromString(accumulatedHtml, 'text/html');
                        document.getElementById('output').innerHTML = tempDoc.body.innerHTML;

                    }
                }
            }
            setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: accumulatedHtml }]);
            _myLocalStorageUtility.setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: accumulatedHtml }]);
           if(readResponse){
                document.getElementById('speak-btn').click();
           }
            
           // console.log(accumulatedHtml)

        }
    }

    // Use useCallback for the handler to prevent unnecessary re-renders
    const handleKeyDownOnPrompt = useCallback((event) => {
        // Basic key down handler implementation
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            // Logic to send message would go here
            console.log("Enter key pressed, simulating message send.");
        }
    }, []);

    useEffect(() => {
        if (selectedChatId) {
            fetchChatsHistory(selectedChatId);
        } else {
            setChatList([]);
        }
    }, [selectedChatId]);

    return (
        <>
            <List sx={{ width: '100%', maxWidth: '100%', bgcolor: 'background.paper' }}>
                {chatList.length === 0 && (
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Welcome
                    </Typography>
                )}
                {chatList.map((chat, index) => {
                    console.log(chat);
                    return (
                        <React.Fragment key={index}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'green' }}>
                                        {chat.userName === 'User' ? <PersonIcon /> : <AssistantIcon />}
                                    </Avatar>
                                </ListItemAvatar>
                                <Typography sx={{ bgcolor: '#addbad', borderRadius: '8px', padding: '8px' }} dangerouslySetInnerHTML={{ __html: chat.Message }} />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    );
                })}
            </List>
            <textarea
                id="prompt"
                className="custom-textarea"
                spellCheck="true"
                style={{ width: '100%' }}
                name="systemPrompt"
                rows="3"
                cols="50"
                placeholder="Enter your prompt"
                onKeyDown={handleKeyDownOnPrompt}
            ></textarea>
        </>
    );
}