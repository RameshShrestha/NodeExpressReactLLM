import React from 'react';
import { useEffect, useState } from 'react'
import { useContext } from "react";
import { DataContext } from "../Dataprovider/DataContext";
import ChatList from './ChatList.jsx';
import AddNewChat from './AddNewChat.jsx';

function Rightcontent() {
    const { theme } = useContext(DataContext);
    const [voices, setVoices] = useState([]);
    const [addChatOpenState, setAddChatOpenState] = useState(false);
    const { models, streamResponse, selectedModel, selectedVoice, setSelectedVoice, 
        setStreamResponse, setSelectedModel,
        readResponse,setReadResponse,
    chats,setChats,selectedChatId,setSelectedChatId,getChatList } = useContext(DataContext);
    
    useEffect(() => {
        const loadVoices = () => {
            if (window && window.speechSynthesis) {
                let availableVoices = window.speechSynthesis.getVoices();
                if (availableVoices.length > 0) {
                    setVoices(availableVoices);
                    if (availableVoices[1]) {
                        setSelectedVoice(availableVoices[1]);
                    }
                }
            }
        };
        
        loadVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [setSelectedVoice]);

    const handleStreamResponseCheckboxChange = (oEvent) => {
        setStreamResponse(oEvent.target.checked);
    }
    
    const handleReadResponseChanged =(oEvent)=>{
        setReadResponse(oEvent.target.checked);
    }
    
    const handleModelChange = (oEvent) => {
        setSelectedModel(oEvent.target.value);
    }
    
    const handleVoiceChange = async (oEvent) => {
        const selectedVoice = voices.find(voice => voice.name === oEvent.target.value);
        setSelectedVoice(selectedVoice);
    }
    
    const handleAddNewChat = async()=>{
        setSelectedChatId(null);
       setAddChatOpenState(true);
    }
    
    const handleAddChatDialogClose = async(data)=>{
         setAddChatOpenState(false);
         await getChatList();
         if(data){
            setSelectedChatId(data.link._id);
         }
    }
    
    const getCapabilites = (selectedModel) =>{
        if(!selectedModel){
            return "";
        }
         let modelDetail = models.filter( model =>  model.text === selectedModel);
         if(modelDetail.length > 0){
            let capabilities = modelDetail[0].capabilities;
             return capabilities.join(', ');
         }else return "";
    }
    
    return (
        <div className={`h-full flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <h1 className={`text-xl sm:text-2xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Ollama Local LLM UI
            </h1>
            
            <div className="space-y-4 flex-1 overflow-y-auto px-2">
                {/* Model Selection */}
                <div className="space-y-2">
                    <label htmlFor="modelName" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                        Select Model:
                    </label>
                    <select
                        className={`w-full p-2.5 text-base border-2 rounded cursor-pointer focus:outline-none ${
                            theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white focus:border-gray-500'
                                : 'border-gray-300 bg-gray-50 text-gray-800 focus:border-gray-600'
                        }`}
                        id="modelName"
                        onChange={handleModelChange}
                        value={selectedModel}
                    >
                        {models && models.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.value}
                            </option>
                        ))}
                    </select>
                    {selectedModel && getCapabilites(selectedModel) && (
                        <div className="bg-indigo-900 text-white px-3 py-2 rounded-lg text-sm font-bold w-fit">
                            {getCapabilites(selectedModel)}
                        </div>
                    )}
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                    <label htmlFor="voiceLanguage" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                        Select Voice:
                    </label>
                    <select
                        className={`w-full p-2.5 text-base border-2 rounded cursor-pointer focus:outline-none ${
                            theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white focus:border-gray-500'
                                : 'border-gray-300 bg-gray-50 text-gray-800 focus:border-gray-600'
                        }`}
                        id="voiceLanguage"
                        onChange={handleVoiceChange}
                        value={selectedVoice?.name}
                    >
                        {voices && voices.map((option) => (
                            <option key={option.name} value={option.name}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="streamResponse"
                            checked={streamResponse}
                            onChange={handleStreamResponseCheckboxChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Use Streaming Response
                        </span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="autoReadResponse"
                            checked={readResponse}
                            onChange={handleReadResponseChanged}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Read Response Automatically
                        </span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handleAddNewChat}
                        className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors font-medium"
                    >
                        Add New Chat
                    </button>
                    <button 
                        className="flex-1 min-w-[120px] bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors font-medium"
                    >
                        Settings
                    </button>
                </div>

                <AddNewChat addChatOpenState={addChatOpenState} handleAddChatDialogClose={handleAddChatDialogClose}/> 

                {/* Chat List */}
                <div className="mt-4">
                    <ChatList 
                        chats={chats} 
                        setChats={setChats} 
                        selectedChatId={selectedChatId} 
                        setSelectedChatId={setSelectedChatId} 
                    />
                </div>
            </div>
        </div>
    );
}

export default Rightcontent;

// Made with Bob
