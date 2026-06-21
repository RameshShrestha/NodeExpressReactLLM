import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LanguageIcon from '@mui/icons-material/Language';
import TextField from '@mui/material/TextField';
// Dialog components for the desktop webcam interface
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function AttachmentPopover({addFile,addURL}) {
  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  
  // References for inputs and video streams
  const fileInputRef = React.useRef(null);
  const mobileCameraRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  // Popover & Webcam Dialog States
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [webcamDialogOpen, setWebcamDialogOpen] = React.useState(false);

  const [urlDialogOpen,setURLDialogOpen] =React.useState(false);
  const [webURL,setWebURL] = React.useState("");
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Trigger Standard File Input
  const handleUploadClick = () => {
    handleClose();
    fileInputRef.current.click();
  };

  // Process selected file from inputs (Standard File or Mobile Camera)
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Selected/Captured File:", files[0]);
        const capturedFile = files[0];

        if (capturedFile.type.startsWith('image/')) {
              const url = URL.createObjectURL(capturedFile);
              capturedFile.previewUrl = url; // Attach preview URL to the file object for easy access
            } else {
                        capturedFile.previewUrl = ''; // No image preview for documents
            }
      addFile(capturedFile); // Update parent state with the selected file
      // Reset the input value to allow re-uploading the same file if needed
      event.target.value = null;
    
      // Process your file upload here
    }
  };
  const handleProvideURL= async()=>{
    setURLDialogOpen(true);
  }
  const processURL = ()=>{
    console.log("URL : ",webURL);
    addURL(webURL);
    setWebURL("");
    closeURLDialog();

  }

  // Core Logic: Determine if Mobile or Desktop when Capture is clicked
  const handleCaptureClick = async () => {
    handleClose();

    // Simple, reliable check for mobile devices
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // 1. Mobile Route: Trigger native camera app
      mobileCameraRef.current.click();
    } else {
      // 2. Desktop Route: Open custom webcam modal
      setWebcamDialogOpen(true);
    }
  };

  // Start webcam video stream when Desktop modal opens
  React.useEffect(() => {
    if (webcamDialogOpen) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
          alert("Could not access webcam. Please check your permissions.");
          setWebcamDialogOpen(false);
        });
    }

    // Cleanup: Stop the camera stream when modal closes
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamDialogOpen]);

  // Capture a snapshot frame from the desktop live video feed
  const captureDesktopSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    // Dynamically create a canvas element to extract the frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas frame back into a standard file object
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        console.log("Desktop Captured File Object:", capturedFile);

             if (capturedFile.type.startsWith('image/')) {
              const url = URL.createObjectURL(capturedFile);
              capturedFile.previewUrl = url; // Attach preview URL to the file object for easy access
            } else {
                        capturedFile.previewUrl = ''; // No image preview for documents
            }
        // Process your desktop file upload here
          addFile(capturedFile); // Update parent state with the selected file
        closeWebcamDialog();
      }
    }, 'image/jpeg');
  };

  const closeWebcamDialog = () => {
    setWebcamDialogOpen(false);
  };

  const closeURLDialog =()=>{
    setURLDialogOpen(false);
  }

  return (
    <div>
      {/* Hidden standard file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,video/*,.pdf,.docx,.txt" 
      />

      {/* Hidden mobile native camera input */}
      <input
        type="file"
        ref={mobileCameraRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment" 
      />

      {/* Main trigger button */}
      <Button
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleClick}
      >
        <AddIcon />
      </Button>

      {/* Selection Popover Menu */}
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: 220, maxWidth: '100%' } }}
      >
        <MenuItem onClick={handleUploadClick}>
          <ListItemIcon><AttachFileIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Upload File</ListItemText>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>⌘U</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleCaptureClick}>
          <ListItemIcon><CameraAltIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Capture</ListItemText>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>⌘P</Typography>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleProvideURL}>
          <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Web URL</ListItemText>
        </MenuItem>
      </Menu>

      {/* Desktop Embedded Webcam Modal Dialog */}
      <Dialog 
        open={webcamDialogOpen} 
        onClose={closeWebcamDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Take Photo
          <IconButton onClick={closeWebcamDialog} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#000', p: 0 }}>
          {/* Live stream element */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={captureDesktopSnapshot}
            startIcon={<CameraAltIcon />}
          >
            Snap Photo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={urlDialogOpen} onClose={closeURLDialog} maxWidth="xl"  fullWidth>

        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Provide the valid URL
          <IconButton onClick={closeURLDialog} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

         <DialogContent dividers sx={{ display: 'flex', minWidth:"90%", justifyContent: 'center',  p: 0 ,margin:'1rem'}}>
          {/* Live stream element */}
             <TextField
                  slotProps={{
                    htmlInput: { spellCheck: false }
                  }}
                  value={webURL}
                  onChange={(oEvent)=>{
                    setWebURL(oEvent.target.value);
                  }}
                  sx={{ width: '100%' }}
                  id="outlined-multiline-flexible"
                  label="URL"
                    placeholder="Provide Valid URL"
                  multiline
                  maxRows={4}
                />
        </DialogContent>
         <DialogActions sx={{ p: 2, justifyContent: 'right' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={processURL}
          
          >
            Continue
          </Button>
        </DialogActions>

      </Dialog>
      
    </div>
  );
}
