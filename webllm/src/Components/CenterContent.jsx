import * as React from 'react';
import { useEffect, useState } from 'react'
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import AssistantIcon from '@mui/icons-material/Assistant';
import CircularProgress from '@mui/material/CircularProgress';
import '../index.css'
import { useContext } from "react";
import { DataContext } from "../Dataprovider/DataContext";
import ChatHistory from "./ChatHistory";
import SystemMessageBox from "./SystemMessageBox";
import { LocalStorage } from "../Dataprovider/LocalStorage.js";
import BusyBar from './BusyBar.jsx';
import ChatContainer from './ChatContainer.jsx';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
const _myLocalStorageUtility = LocalStorage();
 

function CenterContent() {
     TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
    const { models, streamResponse, selectedModel, selectedVoice, setSelectedVoice, setStreamResponse,
         setSelectedModel, readResponse,
         selectedChatId ,setSelectedChatId,getChatList,chats,setChats} = useContext(DataContext);
 //   const [chatHistory, setChatHistory] = useState(_myLocalStorageUtility.getChatHistory());

    const [dialogOpenState, setDialogOpenState] = useState(false);
      const [dialogSystemMessageState, setDialogSystemMessageState] = useState(false);
      const [lastResponse, setLastResponse] = useState("No Response Yet");
    const [busy,setBusy] =useState(false);
    const[systemMessage,setSystemMessage] = useState("");
    const [chatList, setChatList] = useState([]);
    const handleClickOpen = () => {
        setDialogOpenState(true);
    };

    const handleClose = async () => {
        setDialogOpenState(false);
       
    };
    const handleCloseSystemMessage = async (updated) => {
        setDialogSystemMessageState(false);
         if(updated){
            await getChatList();
        }
    };



    var recognition = null;
    // const showChatHistory = async () => {

    //     if (chatHistory) {
    //         setDialogOpenState(true);
    //     } else {
    //         alert('No chat history found.');
    //     }
    // }
    // const handleStreamResponseCheckboxChange = (oEvent) => {
    //     setStreamResponse(oEvent.target.checked);
    // }
    const startRecording = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // for cross-browser compatibility
        if (typeof SpeechRecognition !== "undefined") {
            recognition = new SpeechRecognition();
            recognition.lang = 'en-US'; // Set the language
            recognition.continuous = false; // Capture a single phrase (true for continuous commands)
            recognition.interimResults = false; // Only return final results

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript; // Get the recognized text
                console.log('You said: ' + transcript);
                // You can then use this 'transcript' to update a text field or trigger actions
                document.getElementById('prompt').value = transcript;
                document.getElementById('sendToAI').click();
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error detected: ' + event.error); // Handle errors
            };
            recognition.start();
        }

    }

    const stopRecording = async () => {
        recognition.stop();
    }

    const synth = window.speechSynthesis;

    const stopSpeakText = async () => {
        if (synth.speaking) {
            synth.cancel();
        }
    }

    const speakText = async (text) => {
        if (synth.speaking) {
            console.error('SpeechSynthesisUtterance is already speaking.');
            return;
        }
        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text); // Create an utterance object
            if (selectedVoice) {
                utterThis.voice = selectedVoice; // 3. Assign the voice
            } else {
                console.warn(`Voice  not found, using default.`);
            }
            // Optional: Customize properties
            // utterThis.pitch = 1; 
            // utterThis.rate = 1; 
            // utterThis.lang = 'en-US'; 

            synth.speak(utterThis); // Queue the utterance to be spoken
        }
    }

    // Example usage (triggered by an event, e.g., a button click):
    // document.getElementById('speak-button').addEventListener('click', () => {
    //     const textToSpeak = document.getElementById('text-input').value;
    //     speakText(textToSpeak);
    // });

const clearChats = async()=>{
    if(window.confirm("Are you sure you want to clear all chats? This action cannot be undone.")){
        const response = await fetch('/dataprovider/chatHistory/'+selectedChatId+'/clear', { method: 'POST'});
        if(response.ok){
           getChatList();
           setChatList([]);
           
        }else{
            console.error("Failed to clear chats");
        }
    }
};


    const handleSpeakButtonClick = (oEvent) => {
        // const textToSpeak = document.getElementById('text-input').value;
        let aiResponse = lastResponse; // document.getElementById('output').innerText;
        stopSpeakText(); // stop any ongoing speech and start new one
        speakText(aiResponse);

    }
        const fetchChatsHistory = async(chatId) => {
        try {
            const response = await fetch('/dataprovider/chathistory/' + chatId + "/chatItem");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const chatList = await response.json();
            setChatList(chatList);
         //   console.log("chatList", chatList);
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
            setChatList([]); // Clear list on error
        }
    }
    const showSystemMessage = async()=>{
    setDialogSystemMessageState(true);
}

const handleKeyDownOnPrompt = (oEvent)=>{
    if(oEvent.key === 'Enter' && !oEvent.shiftKey){
        oEvent.preventDefault();
        setChatList([...chatList, {userName:'User', Message: oEvent.target.value, createdAt: new Date()},
                {userName:'Assistant', Message: "Waiting for response...", createdAt: new Date()}
        ]);
        document.getElementById('sendToAI').click();
    }}

    const handleSubmit = async (oEvent) => {
        const modelName = selectedModel; //document.getElementById('modelName').value;
        const prompt = document.getElementById('prompt').value;
        const systemPrompt = systemMessage; //document.getElementById('systemPrompt').value;
        const stream = streamResponse;
        let chatHistory = [];
        for(let i=0;i<chatList.length;i++){
            chatHistory.push({role: chatList[i].userName.toLowerCase(), content: chatList[i].Message});
        }   
        console.log(" Chat History :", chatHistory);

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
                            setChatList([...chatList, {userName:'User', Message: document.getElementById('prompt').value,createdAt: new Date()},
                                {userName:'Assistant', Message: doc.body.innerHTML,createdAt: new Date()}]);
                    }else{
                            setChatList([...chatList,  {userName:'User', Message: document.getElementById('prompt').value,createdAt: new Date()},
                                {userName:'Assistant', Message: doc.body.innerHTML,createdAt: new Date()}]);
                    }
                    document.getElementById('prompt').value = '';
                    setLastResponse(doc.body.innerHTML);
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
           // setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: accumulatedHtml }]);
          //  _myLocalStorageUtility.setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: accumulatedHtml }]);
           if(readResponse){
                document.getElementById('speak-btn').click();
           }
            
           // console.log(accumulatedHtml)

        }
    }
 useEffect(() => {
        if (selectedChatId) {
            fetchChatsHistory(selectedChatId);
         //   console.log("chats",chats);
            let selectedChat = chats.find(chat => chat._id === selectedChatId)
            setSystemMessage(selectedChat?.SystemMessage || ""); // Set system message to chat title for now
        } else {
            setChatList([]);
        }
    }, [selectedChatId,chats]);
    return (
        <>
           
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <button id="start-btn" title="Start Recording" onClick={startRecording} >
                <i className="fa fa-microphone"></i>
            </button>

            <button id="sendToAI" onClick={handleSubmit}>Send To AI</button>
            <button id="speak-btn" onClick={handleSpeakButtonClick}>Read Response</button>
            <button onClick={stopSpeakText}>Stop Reading </button>
             <button onClick={clearChats}>Clear Chats </button> 
             <button onClick={showSystemMessage}>Instructions </button>
            </div>
            {/* <ChatHistory dialogOpenState={dialogOpenState} handleClose={handleClose} chatHistory={chatHistory} /> */}
            <SystemMessageBox dialogOpenState={dialogSystemMessageState} handleClose={handleCloseSystemMessage} systemMessage={systemMessage} selectedChatId={selectedChatId} />
           {busy && <BusyBar/>}
            {/* <div className="dynamic-container" id="output"></div> */}
            {/* <ChatContainer selectedChatId={selectedChatId} /> */}
          

          <List sx={{ width: '100%', maxWidth: '100%', bgcolor: 'background.paper' }}>
                {chatList.length === 0 && (
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Welcome
                    </Typography>
                )}
                {chatList.map((chat, index) => {
                  //  console.log(chat);
                    return (
                        <React.Fragment key={index}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'green' }}>
                                        {chat.userName === 'User' ? <PersonIcon /> : <AssistantIcon />}
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                        primary={
                                            <Typography 
                                                sx={{ bgcolor: '#addbad', borderRadius: '8px', padding: '8px', display: 'inline-block' }} 
                                                dangerouslySetInnerHTML={{ __html: chat.Message }} 
                                            />
                                        }
                                        secondary={
                                            <Typography 
                                                variant="caption" 
                                                gutterBottom 
                                                sx={{ display: 'block', mt: 0.5,color: 'green' }}
                                            >
                                                {chat && chat.createdAt && timeAgo.format(new Date(chat.createdAt))}
                                            </Typography>
                                        }
                                    />
                             </ListItem> 
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    );
                })}
            </List>
           <textarea id="prompt" className="custom-textarea" spellcheck="true" style={{ width: '100%' }} name="systemPrompt" rows="3" cols="50"
             placeholder="Enter your prompt"
             disabled={selectedChatId ? false : true} 

             onKeyDown={handleKeyDownOnPrompt}>
            </textarea> 
              {/* <textarea id="promptdummy" className="custom-textarea" spellcheck="true" style={{ width: '100%' }} name="systemPrompt" rows="3" cols="50"
             placeholder="Enter your prompt Dummy"
             onKeyDown={handleKeyDownOnPrompt_Dummy}>
            </textarea>  */}

        </>)
}
export default CenterContent