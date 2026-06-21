import React from 'react';
import TimeAgo from 'javascript-time-ago';
import { useState, useContext } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import en from 'javascript-time-ago/locale/en';
import { DataContext } from "../Dataprovider/DataContext";

TimeAgo.addDefaultLocale(en);

const ChatList = ({ chats, setChats, selectedChatId, setSelectedChatId }) => {
  const timeAgo = new TimeAgo('en-US');
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useContext(DataContext);

  const handleDeleteChat = async (chatId) => {
    const response = await fetch('/dataprovider/chathistory/' + chatId, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      setChats(chats.filter(chat => chat._id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    } else {
      console.error("Failed to delete chat with ID:", chatId);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full h-[50vh] flex flex-col font-sans rounded-lg ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
    }`}>
      {/* Header Section */}
      <div className={`p-4 sm:p-5 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Chats</h2>
        <input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-none text-sm focus:outline-none focus:ring-2 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
              : 'bg-gray-100 text-gray-800 placeholder-gray-500 focus:ring-blue-500'
          }`}
        />
      </div>

      {/* Chat List Section */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className={`p-4 text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className={`
                flex items-center p-3 sm:p-4 cursor-pointer transition-colors duration-200
                ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-50'}
                ${selectedChatId === chat._id
                  ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
                  : (theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100')
                }
              `}
              onClick={() => setSelectedChatId(chat._id)}
            >
              <div className="flex-1 min-w-0 mr-2">
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-semibold text-sm sm:text-base truncate pr-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {chat.title}
                  </span>
                  <span className={`text-xs whitespace-nowrap flex-shrink-0 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {timeAgo.format(new Date(chat.createdAt))}
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                className={`flex-shrink-0 ml-2 p-1 rounded transition-colors bg-transparent border-none cursor-pointer opacity-70 hover:opacity-100 ${
                  theme === 'dark'
                    ? 'text-red-400 hover:bg-red-900/30'
                    : 'text-red-600 hover:bg-red-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
                aria-label={`Delete chat: ${chat.title}`}
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

// Made with Bob
