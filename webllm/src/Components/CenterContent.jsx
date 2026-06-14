import * as React from 'react';
import { useEffect, useState, useRef } from 'react'
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
import SendIcon from '@mui/icons-material/Send';
import AttachmentPopover from './AttachmentPopover.jsx';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationDialog from './ConfirmationDialog.jsx';
import Snackbar from '@mui/material/Snackbar';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ClearIcon from '@mui/icons-material/Clear';
const _myLocalStorageUtility = LocalStorage();


function CenterContent() {
    TimeAgo.addDefaultLocale(en);
    const timeAgo = new TimeAgo('en-US');
    const { models, streamResponse, selectedModel, selectedVoice, setSelectedVoice, setStreamResponse,
        setSelectedModel, readResponse,
        selectedChatId, setSelectedChatId, getChatList, chats, setChats } = useContext(DataContext);
    //   const [chatHistory, setChatHistory] = useState(_myLocalStorageUtility.getChatHistory());

    const [dialogOpenState, setDialogOpenState] = useState(false);
    const [dialogSystemMessageState, setDialogSystemMessageState] = useState(false);
    const [lastResponse, setLastResponse] = useState("No Response Yet");
    const [busy, setBusy] = useState(false);
    const [systemMessage, setSystemMessage] = useState("");
    const [chatList, setChatList] = useState([]);
    const [latestChatList, setLatestChatList] = useState([]);
    const [files, setFiles] = useState([]);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const containerRef = useRef(null);
    const handleClickOpen = () => {
        setDialogOpenState(true);
    };

    const handleClose = async () => {
        setDialogOpenState(false);

    };
    const handleCloseSystemMessage = async (updated) => {
        setDialogSystemMessageState(false);
        if (updated) {
            await getChatList();
        }
    };

    const addFile = async (selectedFile) => {   
        setFiles([...files, selectedFile]);
    }

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
                // console.log('You said: ' + transcript);
                // You can then use this 'transcript' to update a text field or trigger actions
                document.getElementById('prompt').value = transcript;
                setLatestChatList([{ userName: 'User', Message: transcript, createdAt: new Date() }, { userName: 'Assistant', Message: "Waiting for response...", createdAt: new Date() }]);
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

    const clearChats = async () => {
        // if (window.confirm("Are you sure you want to clear all chats? This action cannot be undone.")) {
        //     const response = await fetch('/dataprovider/chatHistory/' + selectedChatId + '/clear', { method: 'POST' });
        //     if (response.ok) {
        //         getChatList();
        //         setChatList([]);

        //     } else {
        //         console.error("Failed to clear chats");
        //     }
        // }
         setDialogOpen(true);
    };
    const handleConfirmDelete = async (selectedChatId) => {
         const response = await fetch('/dataprovider/chatHistory/' + selectedChatId + '/clear', { method: 'POST' });
           if (response.ok) {
                getChatList();
               setChatList([]);
               setSnackbarOpen(true);

             } else {
                console.error("Failed to clear chats");
           }
            setDialogOpen(false);
        
    }
    const handleCancelDelete = () => {
        setDialogOpen(false);
    }

    const handleSpeakButtonClick = (oEvent, messageToRead) => {
        // const textToSpeak = document.getElementById('text-input').value;
        //   console.log("Message to read:", messageToRead);
        let aiResponse = messageToRead || lastResponse; // document.getElementById('output').innerText;
        stopSpeakText(); // stop any ongoing speech and start new one
        const parser = new DOMParser();
        const doc = parser.parseFromString(aiResponse, 'text/html');
        doc.body.innerText && (aiResponse = doc.body.innerText); // Extract text content for speech synthesis
        speakText(aiResponse);

    }
    const fetchChatsHistory = async (chatId) => {
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
    const showSystemMessage = async () => {
        setDialogSystemMessageState(true);
    }

    const handleKeyDownOnPrompt = (oEvent) => {
        if (oEvent.key === 'Enter' && !oEvent.shiftKey) {
            oEvent.preventDefault();
            // setChatList([...chatList, {userName:'User', Message: oEvent.target.value, createdAt: new Date()},
            //         {userName:'Assistant', Message: "Waiting for response...", createdAt: new Date()}
            // ]);
            let userMessage = oEvent.target.value;
            if(files.length > 0){
                userMessage += "\n\n <br/> Attachments:\n";
             
                userMessage += "\n\n <br/>" + document.getElementById("attachmentContainer").innerHTML;
               // userMessage += "\n\nPlease consider the attachments while formulating your response.";
            }
            setLatestChatList([{ userName: 'User', Message: userMessage, createdAt: new Date() }, { userName: 'Assistant', Message: "Waiting for response...", createdAt: new Date() }]);
            document.getElementById('sendToAI').click();
        }
    }
    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Create a local URL if the file is an image
        if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(''); // No image preview for documents
        }
    };

    // Remove file and clean up memory
    const handleRemoveFile = (file) => {
        setFiles(files.filter(f => f !== file));
    };
    const handleSubmit = async (oEvent) => {
        const modelName = selectedModel; //document.getElementById('modelName').value;
        const prompt = document.getElementById('prompt').value;
        const systemPrompt = systemMessage; //document.getElementById('systemPrompt').value;
        const stream = streamResponse;
        let chatHistory = [];
        for (let i = 0; i < chatList.length; i++) {
            chatHistory.push({ role: chatList[i].userName.toLowerCase(), content: chatList[i].Message });
        }
        // console.log(" Chat History :", chatHistory);
        if (containerRef.current) {
            // 2. Set scrollTop to match the total scrollable height
            containerRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        setBusy(true);


        const formData = new FormData();
        formData.append('modelName', modelName);
        formData.append('prompt', prompt);
        formData.append('systemPrompt', systemPrompt);
        formData.append('stream', stream);
        formData.append('selectedChatId', selectedChatId);
        formData.append('chatHistory', JSON.stringify(chatHistory));

        // Loop and append each file under the SAME key name ('galleryImages')
        if (files ) {
            for (let i = 0; i < files.length; i++) {
                formData.append('attachments', files[i]);
            }
        }
        // Generate text
        if (modelName && prompt && systemPrompt && !stream) {
            fetch('/dataprovider/getLLMResponse', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                .then(async data => {
                    setBusy(false);
                    const parser = new DOMParser();
                    // Parse the string into a new document
                    const doc = parser.parseFromString(data.llmresponse, 'text/html');
                    //    document.getElementById('output').innerHTML = doc.body.innerHTML;
                    //  setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: doc.body.innerHTML }]);
                    //  _myLocalStorageUtility.setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: doc.body.innerHTML }]);



                    if (!selectedChatId) {
                        setChats([...chats, { _id: data.selectedChatId, title: prompt, createdAt: new Date() }]);
                        setSelectedChatId(data.selectedChatId);
                        setChatList([...chatList, { userName: 'User', Message: document.getElementById('prompt').value, createdAt: new Date() },
                        { userName: 'Assistant', Message: doc.body.innerHTML, createdAt: new Date() }]);
                    } else {

                           let userMessage = document.getElementById('prompt').value;
                            if(files.length > 0){
                                userMessage += "\n\n <br/> Attachments:\n";
                            
                                userMessage += "\n\n <br/>" + document.getElementById("attachmentContainer").innerHTML;
                            // userMessage += "\n\nPlease consider the attachments while formulating your response.";
                            }
                        setChatList([...chatList, { userName: 'User', Message: userMessage, createdAt: new Date() },
                        { userName: 'Assistant', Message: doc.body.innerHTML, createdAt: new Date() }]);
                    }
                    setLatestChatList([]);
                    document.getElementById('prompt').value = '';
                    setLastResponse(doc.body.innerHTML);
                    if (readResponse) {
                        // document.getElementById('speak-btn').click();
                        handleSpeakButtonClick(null, doc.body.innerHTML);
                    }

                })
                .catch(error => {
                    setBusy(false);
                    console.error('Error generating text:', error);
                });
        } else if (modelName && prompt && systemPrompt && stream) {
            const parser = new DOMParser();
            const response = await fetch('/dataprovider/getLLMResponse', {
                method: 'POST',
               // headers: { 'Content-Type': 'application/json' },
                body : formData
              //  body: JSON.stringify({ modelName, prompt, systemPrompt, chatHistory, stream, selectedChatId })
            });
            setBusy(false);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedHtml = ''
            //  const doc = parser.parseFromString(data.llmresponse, 'text/html');
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    //   console.log('Stream complete');
                    break;
                }
                const chunk = decoder.decode(value);
                // console.log("Decoded chunk:", chunk);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        accumulatedHtml += data.content;
                        // console.log(data); // Update your UI here
                        const tempDoc = parser.parseFromString(accumulatedHtml, 'text/html');
                        document.getElementById('streamResponseContainer1').innerHTML = tempDoc.body.innerHTML;

                    }
                    // console.log("Accumulated HTML so far:", accumulatedHtml);
                }
            }

            if (!selectedChatId) {
                setChats([...chats, { _id: data.selectedChatId, title: prompt, createdAt: new Date() }]);
                setSelectedChatId(data.selectedChatId);
                setChatList([...chatList, { userName: 'User', Message: document.getElementById('prompt').value, createdAt: new Date() },
                { userName: 'Assistant', Message: accumulatedHtml, createdAt: new Date() }]);
            } else {


                  let userMessage = document.getElementById('prompt').value;
                            if(files.length > 0){
                                userMessage += "\n\n <br/> Attachments:\n";
                            
                                userMessage += "\n <br/>" + document.getElementById("attachmentContainer").innerHTML;
                            // userMessage += "\n\nPlease consider the attachments while formulating your response.";
                            }
                setChatList([...chatList, { userName: 'User', Message: userMessage, createdAt: new Date() },
                { userName: 'Assistant', Message: accumulatedHtml, createdAt: new Date() }]);
            }
            document.getElementById('prompt').value = '';
            setLatestChatList([]);
            setLastResponse(accumulatedHtml);
            // setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: accumulatedHtml }]);
            //  _myLocalStorageUtility.setChatHistory([...chatHistory, { role: 'user', content: prompt }, { role: 'assistant', content: accumulatedHtml }]);
            if (readResponse) {
                // document.getElementById('speak-btn').click();
                handleSpeakButtonClick(null, accumulatedHtml);
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
    }, [selectedChatId, chats]);
    return (
        <>


            {/* <div className="dynamic-container" id="output"></div> */}
            {/* <ChatContainer selectedChatId={selectedChatId} /> */}

            <div id="listContainer" style={{ maxHeight: '72vh', overflowY: 'auto' }}  >
                <List sx={{ width: '100%', maxWidth: '100%', bgcolor: 'background.paper' }} id="chatListContainer">
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
                                            <>
                                            <Typography
                                                sx={{ bgcolor: '#addbad', borderRadius: '8px', padding: '8px', display: 'inline-block' }}
                                                dangerouslySetInnerHTML={{ __html: chat.Message }}
                                            />
                                               {chat.Attachments && (
                                                <Typography
                                                    variant="caption"
                                                    gutterBottom
                                                    sx={{ display: 'block', mt: 0.5, color: 'green' }}
                                                >
                                                    Attachments
                                                    {chat.Attachments.split('\n').map((attachment, idx) => (
                                                        <Typography
                                                            key={idx}
                                                            variant="caption"
                                                            sx={{ display: 'block', mt: 0.5, color: 'blue' }}
                                                        >
                                                            {attachment}
                                                        </Typography>
                                                    ))}
                                                </Typography>
                                            )}
                                            </>

                                            
                                         
                                        }
                                        secondary={
                                            <Typography
                                                variant="caption"
                                                gutterBottom
                                                sx={{ display: 'block', mt: 0.5, color: 'green' }}
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

                <List sx={{ width: '100%', maxWidth: '100%', bgcolor: 'background.paper' }} id="chatListContainerNewChat">
                    {latestChatList.length === 0 && (
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">

                        </Typography>
                    )}
                    {latestChatList.map((chat, index) => {
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
                                            <div id={`streamResponseContainer${index}`} ref={chat.userName === 'Assistant' ? containerRef : null} 
                                                style={{ background: '#addbad', borderRadius: '8px', padding: '8px', display: 'inline-block' }}> <div dangerouslySetInnerHTML={{ __html: chat.Message }} /></div>
                                        }
                                        secondary={
                                            <Typography
                                                variant="caption"
                                                gutterBottom
                                                sx={{ display: 'block', mt: 0.5, color: 'green' }}
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
                {/* Dummy div to maintain reference for auto scrolling */}
                {/* <div ref={containerRef}/>  */}
            </div>
          {selectedChatId && (
            <div style={{ display: 'flex', justifyContent: 'right', gap: '10px', marginBottom: '10px' }}>
                <AttachmentPopover addFile={addFile} />
                <button id="start-btn" title="Start Recording" onClick={startRecording} >
                    <i className="fa fa-microphone"></i>
                </button>

                <button id="sendToAI" onClick={handleSubmit} title="Send to AI"><SendIcon /></button>
                <button id="speak-btn" onClick={handleSpeakButtonClick} title="Read Response"><CampaignIcon /></button>
                <button onClick={stopSpeakText} title="Stop Reading"><VolumeOffIcon /></button>
                <button onClick={clearChats} title="Clear Chats"><ClearIcon /></button>
                <button onClick={showSystemMessage} title="System Message"><SettingsSuggestIcon/> </button>
                   <ConfirmationDialog
                    selectedChatId = {selectedChatId}
                    open={dialogOpen}
                    title="Clear the Chat History"
                    message="This action cannot be undone. All data will be permanently wiped."
                    onConfirm={function() { handleConfirmDelete(selectedChatId); }}
                    onCancel={handleCancelDelete}
                />
                <Snackbar
                    open={snackbarOpen}
                    anchorOrigin = {{ vertical: 'bottom', horizontal: 'center' }}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}  
                    message="Chat history cleared successfully"
                  
                    />
            </div> )}
            {/* <ChatHistory dialogOpenState={dialogOpenState} handleClose={handleClose} chatHistory={chatHistory} /> */}
            <SystemMessageBox dialogOpenState={dialogSystemMessageState} handleClose={handleCloseSystemMessage} systemMessage={systemMessage} selectedChatId={selectedChatId} />
            {busy && <BusyBar />}
            <div id="textAreaContainer" className="textarea-container">
                <div id="attachmentContainer" style={{ display: 'flex', justifyContent: 'left', gap: '5px', marginBottom: '5px' }}>
                    {/* <AttachmentPopover /> */}
                       {files.map((file, index) => (
                            // <li key={index}>{file.name}</li>
                             <div  style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.25rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                    }}>
                            {/* Visual preview: Image thumbnail OR file icon */}
                            {file.previewUrl ? (
                                <img
                                    src={file.previewUrl}
                                    alt="Preview"
                                    style={{ width: "3rem", height: "3rem", borderRadius: "0.25rem", objectFit: "cover" }}
                                />
                            ) : (
                                <div style={{
                                    width: '2rem',
                                    height: '1rem',
                                    backgroundColor: '#dbeafe',
                                    color: '#2563eb',
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {file.name.split('.').pop()}
                                </div>
                            )}

                            {/* File Details */}
                            <div style={{
                                flex: '1 1 0%',
                                minWidth: '0px'
                            }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    lineHeight: '1.25rem',
                                    fontWeight: '500',
                                    color: '#111827',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    margin : "0px"
                                }}>{file.previewUrl ? '' : file.name}</p>
                                <p style={{
                                    fontSize: '0.75rem',
                                    lineHeight: '1.25rem',
                                    color: '#6b7280',
                                    margin : "0px"
                                }}>{(file.size / 1024).toFixed(1)} KB</p>
                            </div>

                            {/* Cross / Remove Button */}
                            <button
                                onClick={() => handleRemoveFile( file)}
                                style={{
                                    borderRadius: '9999px',
                                    backgroundColor: '#e5e7eb',
                                    color: '#4b5563',
                                    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
                                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                                    transitionDuration: '150ms',
                                    border: 'none',
                                    cursor: 'pointer',
                                    margin: '0px',
                                    padding: '0px'

                                }}
                                aria-label="Remove file"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>
                            ))
                            }
                    {/* File Preview Card */}
                  
                   
                </div>
                <textarea id="prompt" className="custom-textarea" spellCheck="true" style={{ width: '100%' }} name="systemPrompt" rows="3" cols="50"
                    placeholder="Enter your prompt"
                    disabled={selectedChatId ? false : true}

                    onKeyDown={handleKeyDownOnPrompt}>
                </textarea>
                <button id="sendToAI2" onClick={handleSubmit} className="inside-button">  <SendIcon /></button>
            </div>
            {/* <textarea id="promptdummy" className="custom-textarea" spellcheck="true" style={{ width: '100%' }} name="systemPrompt" rows="3" cols="50"
             placeholder="Enter your prompt Dummy"
             onKeyDown={handleKeyDownOnPrompt_Dummy}>
            </textarea>  */}

        </>)
}
export default CenterContent