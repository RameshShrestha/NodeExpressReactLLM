import React, { createContext, useContext, useEffect, useState } from "react";
import { LocalStorage } from "./LocalStorage";
const _myLocalStorageUtility = LocalStorage();
const DataContext = createContext({
    contextData: {
        selectedModel: null,
        setSelectedModel: async () => { },
        selectedVoice: null,
        setSelectedVoice : async () => { },
        streamResponse: false,
        setStreamResponse: async () => { },
        getModels: async () => { },
        systemMessage :"",
        setSystemMessage : async () => { },
        readResponse : false,
        setReadResponse  :async () => { },
        getChatList : async () => { },
        chats : [],
        setChats : async () => { },
        selectedChatId : null,
        setSelectedChatId : async () => { }
    }
});

// Create a hook to access the DataContext
const useAppData = () => useContext(DataContext);
// Create a component that provides authentication-related data and functions
const DataProvider = ({ children }) => {

    let defaultSystemMessage  = `Helpful assistant on provided topics, always respond as html5 tags inside div which can be added into webpage.
   You will respond within 100  words for interaction as general communication. 
   Content should not be more than 500 words at all.
    If you have some more information, ask for user if user wanted to know more on that.
     Do not use tools when internal knowledge is sufficient or already knowledge is provided via tool or user.
     When you use tools, always use them at the beginning of the response and do not add any other content in that and your answer should be based on tool response not your response do not need to be in html5 tags for tool use response
      response, wait for tool response and then respond with complete answer using the tool response and internal knowledge.
     Remember todays date and time is ${new Date()}`;
    let initialSystemMessage = _myLocalStorageUtility.getSystemMessage() || defaultSystemMessage; 
    const [isLoading, setIsLoading] = useState(false);
    const [systemMessage,setSystemMessage] = useState(initialSystemMessage);
    const [models, setModels] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [streamResponse, setStreamResponse] = useState(false);
      const [readResponse, setReadResponse] = useState(false);
    const [selectedModel, setSelectedModel] = useState("granite4.1:8b");
    const getModels = async () => {
        const response = await fetch('/dataprovider/getModels');
        const models = await response.json();
        const modelOptions = models.map(m => ({
            value: m.name,
            text: `${m.name}`,
            capabilities : m.capabilities
        }));
        setModels(modelOptions);
       // return models;
    }
    const getChatList = async()=>{
        const response = await fetch('/dataprovider/chathistory');
        const chatList = await response.json();
        setChats(chatList.chats);
       // console.log("chatList", chatList);
    }

    // Load Available Models 
    useEffect(() => {
             const initData = async () => {
            setIsLoading(true);
            // Run both fetches in parallel for better performance
            await Promise.all([getModels(), getChatList()]);
            setIsLoading(false);
        };

        initData();
        //  getModels();
        //  getChatList();
    
    }, []);
const values = {
        selectedModel,
        setSelectedModel,
        selectedVoice,
        setSelectedVoice,
        streamResponse,
        setStreamResponse,
        models,
        systemMessage,
        setSystemMessage,
        readResponse,
        setReadResponse,
        chats,
        setChats,
        selectedChatId,
        setSelectedChatId,
        getChatList

    };
    // Provide authentication-related data and functions through the context
    return (
        <DataContext.Provider value={values }>
            {isLoading ?  <div>Loading...</div> : children}
            {/* Display a loader while loading */}
        </DataContext.Provider>
    );
};

// Export the context, provider component, and custom hook
export { DataContext, DataProvider, useAppData };
