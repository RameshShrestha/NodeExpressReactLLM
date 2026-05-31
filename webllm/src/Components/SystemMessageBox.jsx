import * as React from 'react';
import { useEffect, useState } from 'react'
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
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { selectClasses } from '@mui/material/Select';
//import { TransitionProps } from '@mui/material/transitions';
const _myLocalStorageUtility = LocalStorage();
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} timeout={{ enter: 800, exit: 800 }} />;
});

export default function SystemMessageBox({ dialogOpenState, handleClose, systemMessage ,selectedChatId}) {
      const [text, setText] = useState(systemMessage);
      useEffect(() => {
    //    console.log("SystemMessageBox useEffect triggered with systemMessage:", systemMessage);
        setText(systemMessage);
     }, [systemMessage]);
 const handleSystemMessageChange = async(oEvent)=>{
             setText(oEvent.target.value);
     };
    const handleSaveAndClose = async()=>{
        console.log("Saving system message:", text);
        if(!selectedChatId){
            alert("No chat selected. Please select a chat to save the system message.");
            return;
        }   
       await fetch('/dataprovider/chatHistory/'+ selectedChatId, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SystemMessage: text })
        })        .then(response => response.json())
        .then(data => {
            console.log('System message updated:', data);     
                   handleClose(true);
        })
        .catch(error => {
            console.error('Error updating system message:', error);      
                  handleClose();
        });
    };


    return (
        <React.Fragment>
   
            <Dialog
                
                fullScreen
                open={dialogOpenState}
                onClose={handleClose}
                slots={{
                    transition: Transition,
                }}
                  PaperProps={{
                        sx: {
                        width: '900px', // Custom fixed width
                        height: '100vh', // Custom fixed height
                        maxWidth: '100%', // Ensures responsiveness on smaller screens
                        }
                    }}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                       
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            System Instructions
                        </Typography>
                        <Button autoFocus color="inherit" onClick={handleClose}>
                            Close
                        </Button>
                        <Button autoFocus color="inherit" onClick={handleSaveAndClose} >
                            Save
                        </Button>
                    </Toolbar>
                </AppBar>
              {/* <div> System Message: {systemMessage} from LL</div> */}
                <TextareaAutosize
                    maxRows={20}
                    aria-label="maximum height"
                    placeholder="Maximum 4 rows"
                    defaultValue="System Message"
                    value={text}
                    onChange={handleSystemMessageChange}
                    style={{ width: 'auto', height:'auto', padding:'10px', fontSize:'16px' }}
                />
            </Dialog>
        </React.Fragment>
    );
}
