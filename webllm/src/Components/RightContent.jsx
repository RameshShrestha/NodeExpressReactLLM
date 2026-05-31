import React from 'react';
import { useEffect, useState } from 'react'
import { useContext } from "react";
import { DataContext } from "../Dataprovider/DataContext";
import { LocalStorage } from "../Dataprovider/LocalStorage.js";
import ChatList from './ChatList.jsx';
import AddNewChat from './AddNewChat.jsx';
const _myLocalStorageUtility = LocalStorage();
function Rightcontent() {
    const [voices, setVoices] = useState([]);
    const [addChatOpenState, setAddChatOpenState] = useState(false);
    const { models, streamResponse, selectedModel, selectedVoice, setSelectedVoice, 
        setStreamResponse, setSelectedModel,systemMessage,setSystemMessage ,
        readResponse,setReadResponse,
    chats,setChats,selectedChatId,setSelectedChatId,getChatList } = useContext(DataContext);
    useEffect(() => {
        // Fetch available models on component mount
        if (window && window.speechSynthesis) {
            let availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            setSelectedVoice(availableVoices[1]);
        }
    }, []);

//     const sSystemPromptText = `Helpful assistant on provided topics, always respond as html5 tags inside div which can be added into webpage.
//    You will respond within 100  words for interaction as general communication. 
//    Content should not be more than 500 words at all.
//     If you have some more information, ask for user if user wanted to know more on that.
//      Do not use tools when internal knowledge is sufficient or already knowledge is provided via tool or user
//      Remember todays date and time is ${new Date()}`;

     const handleSystemMessageChanged = async(oEvent)=>{
             setSystemMessage(oEvent.target.value);
                _myLocalStorageUtility.setSystemMessage(oEvent.target.value);
     };
    let recognition = null;
    const showChatHistory = async () => {

        if (chatHistory) {
            console.log(chatHistory);
        } else {
            alert('No chat history found.');
        }
    }
    const handleStreamResponseCheckboxChange = (oEvent) => {
        setStreamResponse(oEvent.target.checked);
    }
    const handleReadResponseChanged =(oEvent)=>{
        //readResponse
        setReadResponse(oEvent.target.checked);

    }
    const handleModelChange = (oEvent) => {
        setSelectedModel(oEvent.target.value);
    }
    const handleVoiceChange = async (oEvent) => {
        const selectedVoice = voices.find(voice => voice.name === oEvent.target.value);
        setSelectedVoice(selectedVoice);
        console.log(oEvent.target.value, "Selected")
    }
    const handleAddNewChat = async()=>{
        setSelectedChatId(null);
        console.log("Opening Add New Chat dialog");
       setAddChatOpenState(true);
    }
    const handleAddChatDialogClose = async(data)=>{
        // After closing the Add New Chat dialog, refresh the chat list to show the newly added chat
         setAddChatOpenState(false);
         await getChatList();
         if(data){
            setSelectedChatId(data.link._id); // Automatically select the newly created chat
         }
    }
    
    return (
        <div style={{ background: "white" }}>
            <h1>Ollama Local LLM UI</h1>
            <label htmlFor="modelName">Select Model:</label>
            <select className='mySelect' id="modelName" onChange={handleModelChange} value={selectedModel}>
                {models && models.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.value}
                    </option>
                ))}
            </select>
 {/*
            <label> Select the voice :
                <select className='mySelect' id="voiceLanguage" onChange={handleVoiceChange} value={selectedVoice?.name}>
                    {voices && voices.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                <input type="checkbox" name="streamResponse" checked={streamResponse} onChange={handleStreamResponseCheckboxChange} />
                Use Streaming Response
            </label>
             <label>
                <input type="checkbox" name="autoReadResponse" checked={readResponse} onChange={handleReadResponseChanged} />
                Read Response automatically
            </label> */}
             {/* <label htmlFor="systemPrompt">Instruction:</label> */}
            {/* <textarea id="systemPrompt" className="systemtextarea" style={{ width: '100%' }} name="systemPrompt" 
            onChange={handleSystemMessageChanged} rows="15" cols="50" placeholder="System Prompt" defaultValue={systemMessage}>
            </textarea> */}
            <button onClick={handleAddNewChat}>Add New Chat</button><button >Settings</button>
              <AddNewChat addChatOpenState={addChatOpenState} handleAddChatDialogClose={handleAddChatDialogClose}/> 

           <ChatList chats={chats} setChats={setChats} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} />
         {/* <button onClick={showChatHistory}>Show Chat History</button> */}
         {/* {chatHistory && chatHistory.map(chat=>{ */}    
        </div>
    );
}

export default Rightcontent;