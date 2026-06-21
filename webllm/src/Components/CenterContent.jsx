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
import Link from '@mui/material/Link';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpDialog from './HelpDialog.jsx';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
const _myLocalStorageUtility = LocalStorage();


function CenterContent() {
    TimeAgo.addDefaultLocale(en);
    const timeAgo = new TimeAgo('en-US');
    const { models, streamResponse, selectedModel, selectedVoice, setSelectedVoice, setStreamResponse,
        setSelectedModel, readResponse,
        selectedChatId, setSelectedChatId, getChatList, chats, setChats, theme, setTheme } = useContext(DataContext);
    //   const [chatHistory, setChatHistory] = useState(_myLocalStorageUtility.getChatHistory());

    const [dialogOpenState, setDialogOpenState] = useState(false);
    const [dialogSystemMessageState, setDialogSystemMessageState] = useState(false);
    const [lastResponse, setLastResponse] = useState("No Response Yet");
    const [busy, setBusy] = useState(false);
    const [systemMessage, setSystemMessage] = useState("");
    const [chatList, setChatList] = useState([]);
    const [latestChatList, setLatestChatList] = useState([]);
    const [files, setFiles] = useState([]);
    const [addedURL, setAddedURL]=useState("");
    const [previewUrl, setPreviewUrl] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [toastMessage,setToastMessage] = useState("");
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
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
    const addURL = async (webURL) => {   
        setAddedURL(webURL);
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
        setToastMessage("Chat history cleared successfully");
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
        let imageUploaded = false;
        if (oEvent.key === 'Enter' && !oEvent.shiftKey) {
            oEvent.preventDefault();

               if (files ) {
            for (let i = 0; i < files.length; i++) {
                if(files[i].type?.indexOf("image")> -1){
                    imageUploaded = true;
                }
            }
        }
        if(imageUploaded){
            //check if model supports image

            console.log("Image supported Model should be selected");

            console.log(models,selectedModel);
            let modelDetail = models.filter( model=>  model.text === selectedModel);
            if(modelDetail.length> -1 &&  modelDetail[0].capabilities.includes("vision")){
                console.log("Model Supports the Image");
                    
            }else{
                setToastMessage("Model Does not Supports the Image");
                setSnackbarOpen(true);
                console.log("Model Does not Supports the Image");
                setBusy(false);
                return;
            }
              
            
        }

          
            // setChatList([...chatList, {userName:'User', Message: oEvent.target.value, createdAt: new Date()},
            //         {userName:'Assistant', Message: "Waiting for response...", createdAt: new Date()}
            // ]);
            let userMessage = oEvent.target.value;

            if(userMessage === "" && files.length === 0){
            setToastMessage("No message or files");
            setSnackbarOpen(true);
            return;
        }
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
      // 2. Define the scrolling function
  const scrollToBottom = () => {
   // containerRef.current?.scrollIntoView({ behavior: "smooth" });
    const listContainer = document.getElementById('listContainer');
        if (listContainer) {
            listContainer.scrollTop = listContainer.scrollHeight + 100;
        }
  };
    const handleSubmit = async (oEvent) => {
        const modelName = selectedModel; //document.getElementById('modelName').value;
        const prompt = document.getElementById('prompt').value;
        const systemPrompt = systemMessage; //document.getElementById('systemPrompt').value;
        const stream = streamResponse;

        if(prompt === "" && files.length === 0){
            setToastMessage("No message or files");
            setSnackbarOpen(true);
            return;
        }
        let chatHistory = [];
        for (let i = 0; i < chatList.length; i++) {
            chatHistory.push({ role: chatList[i].userName.toLowerCase(), content: chatList[i].Message });
        }
        // console.log(" Chat History :", chatHistory);
        if (containerRef.current) {
            // 2. Set scrollTop to match the total scrollable height
            containerRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
          scrollToBottom();
        setBusy(true);

        let imageUploaded = false;
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
                if(files[i].type?.indexOf("image")> -1){
                    imageUploaded = true;
                }
            }
        }

        if(imageUploaded){
            //check if model supports image

            console.log("Image supported Model should be selected");

            console.log(models,selectedModel);
            let modelDetail = models.filter( model=>  model.text === selectedModel);
            if(modelDetail.length> -1 &&  modelDetail[0].capabilities.includes("vision")){
                console.log("Model Supports the Image");
                    
            }else{
                setToastMessage("Model Does not Supports the Image");
                setSnackbarOpen(true);
                console.log("Model Does not Supports the Image");
                setBusy(false);
                return;
            }
              
            
        }

        if(addedURL.length> 0){
             formData.append('addedURL', addedURL);
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
                        scrollToBottom();
                    setLatestChatList([]);
                    setFiles([]);
                     setAddedURL("");
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
                scrollToBottom();
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
                 scrollToBottom();
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
            setFiles([]);
            setAddedURL("");
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
    useEffect(() => {
        scrollToBottom();
    }, [chats]);

    // Add copy buttons to code blocks
    useEffect(() => {
        const addCopyButtons = () => {
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach((codeBlock) => {
                const pre = codeBlock.parentElement;
                
                // Check if copy button already exists
                if (pre.querySelector('.copy-code-button')) {
                    return;
                }

                // Create copy button
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-code-button';
                copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                copyButton.title = 'Copy code';
                
                // Add click handler
                copyButton.addEventListener('click', async () => {
                    const code = codeBlock.textContent;
                    try {
                        await navigator.clipboard.writeText(code);
                        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        copyButton.style.color = '#10b981';
                        
                        setTimeout(() => {
                            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                            copyButton.style.color = '';
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                    }
                });

                // Position the button
                pre.style.position = 'relative';
                pre.appendChild(copyButton);
            });
        };

        // Run after chat list updates
        addCopyButtons();
    }, [chatList, latestChatList]);
    return (
        <div className="flex flex-col h-full">
            {/* Header with Theme Toggle and Help Button */}
            <div className="flex justify-end gap-2 mb-2">
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 border border-purple-500/30"
                    title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                    {theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                    <span className="text-sm font-medium">{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
                <button
                    onClick={() => setHelpDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 border border-blue-500/30"
                    title="Help & Instructions"
                >
                    <HelpOutlineIcon fontSize="small" />
                    <span className="text-sm font-medium">Help</span>
                </button>
            </div>

            {/* Chat Messages Container - Takes remaining space */}
            <div id="listContainer" className="flex-1 overflow-y-auto mb-4">
                <List className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} id="chatListContainer">
                    {chatList.length === 0 && (
                        <div className="flex items-center justify-center h-full min-h-[8vh]">
                            <Typography variant="h6" component="div" className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                Welcome
                            </Typography>
                        </div>
                    )}
                    {chatList.map((chat, index) => {
                        return (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start" className="py-3">
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#16a34a' }}>
                                            {chat.userName === 'User' ? <PersonIcon /> : <AssistantIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <>
                                            <div
                                                className={`rounded-lg p-2 inline-block max-w-full break-words ${
                                                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-green-200 text-gray-900'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: chat.Message }}
                                            />
                                               {chat.Attachments && (
                                                <div className="block mt-2 text-green-600 text-xs">
                                                    <div className="font-semibold">Attachments</div>
                                                    {chat.Attachments.split('\n').map((attachment, idx) => (
                                                        <div key={idx} className="block mt-1 text-blue-600">
                                                            {attachment}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {chat.addedURL && (
                                                <div className="block mt-2 text-green-600 text-xs">
                                                    Added URL:
                                                    <Link
                                                        href={chat.addedURL}
                                                        underline="hover"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-1"
                                                    >
                                                        {chat.addedURL}
                                                    </Link>
                                                </div>
                                            )}
                                            </>
                                        }
                                        secondary={
                                            <span className="block mt-1 text-green-600 text-xs">
                                                {chat && chat.createdAt && timeAgo.format(new Date(chat.createdAt))}
                                            </span>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        );
                    })}
                </List>

                <List className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} id="chatListContainerNewChat">
                    {latestChatList.length === 0 && (
                        <Typography className="ml-4 flex-1" variant="h6" component="div">
                        </Typography>
                    )}
                    {latestChatList.map((chat, index) => {
                        return (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start" className="py-3">
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#16a34a' }}>
                                            {chat.userName === 'User' ? <PersonIcon /> : <AssistantIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <div
                                                id={`streamResponseContainer${index}`}
                                                ref={containerRef}
                                                className={`rounded-lg p-2 inline-block max-w-full break-words ${
                                                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-green-200 text-gray-900'
                                                }`}
                                            >
                                                <div dangerouslySetInnerHTML={{ __html: chat.Message }} />
                                            </div>
                                        }
                                        secondary={
                                            <span className="block mt-1 text-green-600 text-xs">
                                                {chat && chat.createdAt && timeAgo.format(new Date(chat.createdAt))}
                                            </span>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        );
                    })}
                </List>
                <div />
                {/* Dummy div to maintain reference for auto scrolling */}
            </div>

            {/* Action Buttons and Textarea - Fixed at bottom */}
            <div className="flex-shrink-0">
                {selectedChatId && (
                    <div className="flex flex-wrap justify-end gap-2 mb-2 sm:mb-3">
                <AttachmentPopover addFile={addFile} addURL ={addURL}/>
                <button
                    id="start-btn"
                    title="Start Recording"
                    onClick={startRecording}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    <i className="fa fa-microphone"></i>
                </button>

                <button
                    id="sendToAI"
                    onClick={handleSubmit}
                    title="Send to AI"
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    <SendIcon fontSize="small" />
                </button>
                <button
                    id="speak-btn"
                    onClick={handleSpeakButtonClick}
                    title="Read Response"
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    <CampaignIcon fontSize="small" />
                </button>
                <button
                    onClick={stopSpeakText}
                    title="Stop Reading"
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    <VolumeOffIcon fontSize="small" />
                </button>
                <button
                    onClick={clearChats}
                    title="Clear Chats"
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    <ClearIcon fontSize="small" />
                </button>
                <button
                    onClick={showSystemMessage}
                    title="System Message"
                    className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    <SettingsSuggestIcon fontSize="small" />
                </button>
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
                    message={toastMessage}
                  
                    />
                    </div>
                )}
                
                {/* Textarea Container - Always at bottom */}
                <div id="textAreaContainer" className="textarea-container">
                <div id="attachmentContainer" className="flex flex-wrap justify-start gap-2 mb-2">
                    {/* <AttachmentPopover /> */}
                       {files.map((file) => (
                            <div key={file.name} className="relative flex items-center gap-3 p-1 bg-gray-50 border border-gray-200 rounded-lg">
                            {/* Visual preview: Image thumbnail OR file icon */}
                            {file.previewUrl ? (
                                <img
                                    src={file.previewUrl}
                                    alt="Preview"
                                    className="w-12 h-12 rounded object-cover"
                                />
                            ) : (
                                <div className="w-8 h-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-xs uppercase">
                                    {file.name.split('.').pop()}
                                </div>
                            )}

                            {/* File Details */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap m-0">
                                    {file.previewUrl ? '' : file.name}
                                </p>
                                <p className="text-xs text-gray-600 m-0">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>

                            {/* Cross / Remove Button */}
                            <button
                                onClick={() => handleRemoveFile(file)}
                                className="rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors border-none cursor-pointer m-0 p-0"
                                aria-label="Remove file"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>
                            ))
                            }
                    {/* File Preview Card */}
                  
                   
                </div >
               {addedURL && (
                   <div id="urlContainer" className="m-1 p-2 bg-blue-50 rounded text-sm">
                       Added URL: <a href={addedURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                           {addedURL}
                       </a>
                   </div>
               )}
                <textarea
                    id="prompt"
                    className={`w-full ${theme === 'dark' ? 'custom-textarea-dark' : 'custom-textarea'}`}
                    spellCheck="true"
                    name="systemPrompt"
                    rows="3"
                    cols="50"
                    placeholder="Enter your prompt"
                    disabled={!selectedChatId}
                    onKeyDown={handleKeyDownOnPrompt}>
                </textarea>
                <button
                    id="sendToAI2"
                    onClick={handleSubmit}
                    className="inside-button"
                >
                    <SendIcon />
                </button>
                </div>
            </div>

            {/* Dialogs and Overlays */}
            <HelpDialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} />
            <SystemMessageBox dialogOpenState={dialogSystemMessageState} handleClose={handleCloseSystemMessage} systemMessage={systemMessage} selectedChatId={selectedChatId} />
            {busy && <BusyBar />}
        </div>
    )
}
export default CenterContent