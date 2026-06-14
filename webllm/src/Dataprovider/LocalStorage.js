const LocalStorage = function () {
    const setChatHistory = (chatHistory) => {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    const removeChatHistory = () => {
         localStorage.setItem('chatHistory', []);
    }
    const getChatHistory = () => {
        let chatHistory = localStorage.getItem('chatHistory');
        if (chatHistory) {
            return (JSON.parse(chatHistory));
        } else {
            return [];
        }
    }
    const setSystemMessage = (systemMessage) => {
        // console.log("Setting system message in local storage", systemMessage);
        localStorage.setItem('systemMessage', systemMessage);
    }
    const getSystemMessage = () => {
       // console.log("Getting system message from local storage");
        return localStorage.getItem('systemMessage');
    }
    return {
        setChatHistory: setChatHistory,
        removeChatHistory: removeChatHistory,
        getChatHistory: getChatHistory,
        setSystemMessage: setSystemMessage,
        getSystemMessage: getSystemMessage
    };
}
export { LocalStorage };