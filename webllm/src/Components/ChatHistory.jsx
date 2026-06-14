import * as React from 'react';
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
//import { TransitionProps } from '@mui/material/transitions';
const _myLocalStorageUtility = LocalStorage();
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// React.useEffect(() => {
    
// },[chatHistory]);

export default function FullScreenDialog({ dialogOpenState, handleClose, chatHistory1 }) {
        const [chatHistory, setChatHistory] =React.useState(_myLocalStorageUtility.getChatHistory());
        console.log(chatHistory);
    //   const [open, setOpen] = React.useState(false);

const handleClearHistory = ()=>{
_myLocalStorageUtility.removeChatHistory();
setChatHistory(_myLocalStorageUtility.getChatHistory());
}
    //   const handleClickOpen = () => {
    //     setOpen(true);
    //   };

    //   const handleClose = () => {
    //     setOpen(false);
    //   };
  //  console.log("dialogOpenState", dialogOpenState, handleClose, chatHistory)
    return (
        <React.Fragment>
            {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open full-screen dialog
      </Button> */}
            <Dialog
                fullScreen
                open={dialogOpenState}
                onClose={handleClose}
                slots={{
                    transition: Transition,
                }}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        {/* <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton> */}
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Chat History
                        </Typography>
                        <Button autoFocus color="inherit" onClick={handleClose}>
                            Close
                        </Button>
                        <Button autoFocus color="inherit" onClick={handleClearHistory}>
                            Clear History
                        </Button>
                    </Toolbar>
                </AppBar>
                <List sx={{ width: '100%', maxWidth: '100%', bgcolor: 'background.paper' }}>
                    {chatHistory && chatHistory.length === 0 && <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Chat History Not Available
                        </Typography> }
                    {chatHistory && chatHistory.map(chat=>{
                        console.log(chat);
                        return(<><ListItem alignItems="flex-start">
                        <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'green'}} >{chat.role === 'user' ? <PersonIcon/>:<AssistantIcon/>}</Avatar>

                        </ListItemAvatar>
                        <Typography sx={{ bgcolor: '#addbad', borderRadius:'8px',padding:'8px'}} dangerouslySetInnerHTML={{ __html: chat.content }} />
                    </ListItem><Divider variant="inset" component="li" /> </>)
                    })}
                    
                </List>
            </Dialog>
        </React.Fragment>
    );
}
