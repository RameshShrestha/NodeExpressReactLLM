import React from 'react';
import TimeAgo from 'javascript-time-ago';
import { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
// Import the locale you want to use (e.g., English)
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);
const ChatList = ({ chats, setChats, selectedChatId, setSelectedChatId }) => {
  const timeAgo = new TimeAgo('en-US');
     const handleDeleteChat = async (chatId) => {
        // if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
        //   //  onDeleteChat(chatId);
        //   console.log("Delete chat with ID:", chatId);

        // }
      //  DELETE http://localhost:5000/chathistory/69fc4fd99f72870f141c1c0c
   
          const response = await fetch('/dataprovider/chathistory/' + chatId, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                // Remove the deleted chat from the local state
                setChats(chats.filter(chat => chat._id !== chatId));
                // If the deleted chat was selected, clear the selection
                if (selectedChatId === chatId) {
                    setSelectedChatId(null);
                }
            } else {
                console.error("Failed to delete chat with ID:", chatId);
            }
    };
  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>Chats</h1>
        <input 
          placeholder="Search conversations..." 
          style={styles.searchInput}
        />
      </div>

      {/* Chat List Section */}
      <div style={styles.listContainer}>
        {chats.map((chat) => (
          <div key={chat._id} style={styles.chatItem}    className={selectedChatId === chat._id ? 'selected chat-hover' : 'unselected chat-hover'} onClick={() => setSelectedChatId(chat._id)}>
            
            <div style={styles.infoSection}>
              <div style={styles.topRow}>
                <span style={styles.name}>{chat.title}</span>
                <span style={styles.time}>{timeAgo.format(new Date(chat.createdAt))}</span>
              </div>
              {/* <div style={styles.bottomRow}>
                <p style={styles.preview}></p>
                {chat.unread > 0 && (
                  <span style={styles.badge}>{chat.unread}</span>
                )}
              </div> */}
               {/* Delete Button */}
                      
            </div>
            <button 
        className="delete-btn" 
        onClick={(e) => {
            e.stopPropagation(); // Prevents the click from triggering the chat selection
            handleDeleteChat(chat._id);
        }}
        aria-label={`Delete chat with ${chat.name}`}
    >
        <DeleteIcon />
    </button>
            
              {/* <button title="Delete Conversation" onClick={() => {}} style={{backgroundColor:'blue', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px'}}>X</button>
            */}
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    width: '100%',
    height: '50vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #f0f0f0'
  },
  title: {
    fontSize: '22px',
    margin: '0 0 15px 0',
    color: '#333'
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#f5f5f5',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto'
  },
  chatItem: {
    display: 'flex',
    padding :'5px',
    cursor: 'pointer',
    borderBottom: '1px solid #fafafa',
    transition: 'background 0.2s'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginRight: '15px',
    objectFit: 'cover'
  },
  infoSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0 // Helps with text truncation
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  name: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#1a1a1a'
  },
  time: {
    fontSize: '12px',
    color: '#888'
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  preview: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px'
  },
  badge: {
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 7px',
    borderRadius: '10px',
    marginLeft: '10px'
  }
};

export default ChatList;
