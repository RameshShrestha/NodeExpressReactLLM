import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
export default function AddNewChat({ addChatOpenState, handleAddChatDialogClose }) {
   let defaultSystemMessage  = `Helpful assistant on provided topics, always respond as html5 tags inside div which can be added into webpage.
   You will respond within 100  words for interaction as general communication. 
   Content should not be more than 500 words at all.
    If you have some more information, ask for user if user wanted to know more on that.
     Do not use tools when internal knowledge is sufficient or already knowledge is provided via tool or user.
     When you use tools, always use them at the beginning of the response and do not add any other content in that and your answer should be based on tool response not your response do not need to be in html5 tags for tool use response
      response, wait for tool response and then respond with complete answer using the tool response and internal knowledge.
     Remember todays date and time is ${new Date()}`;
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
     const formJson = Object.fromEntries(formData.entries());
    const title = formJson.title;
    const systemMessage = formJson.systemMessage || "You are a helpful assistant. Answer questions to the best of your ability.";
    // console.log(email);

    // Send the new chat data to the server
    fetch('/dataprovider/chathistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, systemMessage })
    })
    .then(response => response.json())
    .then(data => {
      console.log('New chat created:', data);
      handleAddChatDialogClose(data);
    })
    .catch(error => {
      console.error('Error creating new chat:', error);
    });
  };

  return (
    <React.Fragment>
      <Dialog open={addChatOpenState} onClose={handleAddChatDialogClose}
        PaperProps={{
    sx: {
      width: '900px', // Custom fixed width
      maxWidth: '100%', // Ensures responsiveness on smaller screens
    },
  }}>
        <DialogTitle>Add New Chat</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Add New Chat title and System Message.
          </DialogContentText> */}
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
              autoFocus
              required
              margin="dense"
              id="title"
              name="title"
              label="Chat Title"
              type="text"
              fullWidth
              variant="standard"
            />
          <TextField
              margin="dense"
              id="systemMessage"     
              name="systemMessage"
              label="System Message"
              multiline
              defaultValue={defaultSystemMessage}
              rows={12}
              fullWidth
              variant="standard"
            />
          </form>
        </DialogContent>
        <DialogActions>
       
          <Button type="submit" form="subscription-form">
            Create
          </Button>
             <Button onClick={handleAddChatDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
