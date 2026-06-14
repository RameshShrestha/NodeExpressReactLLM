import { useEffect, useState } from 'react'

import CenterContent from './Components/CenterContent'
import './index.css'
import Rightcontent from './Components/RightContent'

function App() {
 // const [count, setCount] = useState(0);
 // const [models, setModels] = useState([]);
//  const [voices,setVoices] = useState([]);
//  const [selectedVoice,setSelectedVoice]=useState(null);
//  const[streamResponse, setStreamResponse] = useState(false);
  //const [chatHistory, setChatHistory] = useState([]);
 // const [selectedModel, setSelectedModel] = useState("granite4:latest");
 
 

  // useEffect(() => {
  //   // Fetch available models on component mount
  //  // getModels();
  //   if(window && window.speechSynthesis){
  //   let availableVoices = window.speechSynthesis.getVoices();
  //   setVoices(availableVoices);

  // }
  // }, []);
  // let recognition = null;
  // const showChatHistory = async () => {

  //   if (chatHistory) {
  //     console.log(chatHistory);
  //   } else {
  //     alert('No chat history found.');
  //   }
  // }
  // const handleStreamResponseCheckboxChange = (oEvent) => {
  //   setStreamResponse(oEvent.target.checked);
  // }
  // const startRecording = async () => {
  //   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // for cross-browser compatibility
  //   if (typeof SpeechRecognition !== "undefined") {
  //     recognition = new SpeechRecognition();
  //     recognition.lang = 'en-US'; // Set the language
  //     recognition.continuous = false; // Capture a single phrase (true for continuous commands)
  //     recognition.interimResults = false; // Only return final results

  //     recognition.onresult = (event) => {
  //       const transcript = event.results[0][0].transcript; // Get the recognized text
  //       console.log('You said: ' + transcript);
  //       // You can then use this 'transcript' to update a text field or trigger actions
  //       document.getElementById('prompt').value = transcript;
  //       document.getElementById('sendToAI').click();
  //     };

  //     recognition.onerror = (event) => {
  //       console.error('Speech recognition error detected: ' + event.error); // Handle errors
  //     };
  //     recognition.start();
  //   }

  // }
  // const handleVoiceChange = async (oEvent) => {

    
  //   const selectedVoice = voices.find(voice => voice.name === oEvent.target.value);
  //   setSelectedVoice(selectedVoice);
  //   console.log(oEvent.target.value, "Selected")
  // }
  // const stopRecording = async () => {
  //   recognition.stop();
  // }

  //const synth = window.speechSynthesis;
  
  // const stopSpeakText = async () => {
  //   if (synth.speaking) {
  //     synth.cancel();
  //   }
  // }

  // const speakText = async (text) => {
  //   if (synth.speaking) {
  //     console.error('SpeechSynthesisUtterance is already speaking.');
  //     return;
  //   }
  //   if (text !== '') {
  //     const utterThis = new SpeechSynthesisUtterance(text); // Create an utterance object
  //     if (selectedVoice) {
  //         utterThis.voice = selectedVoice; // 3. Assign the voice
  //       } else {
  //         console.warn(`Voice  not found, using default.`);
  //       }
  //     // Optional: Customize properties
  //     // utterThis.pitch = 1; 
  //     // utterThis.rate = 1; 
  //     // utterThis.lang = 'en-US'; 

  //     synth.speak(utterThis); // Queue the utterance to be spoken
  //   }
  // }

  // Example usage (triggered by an event, e.g., a button click):
  // document.getElementById('speak-button').addEventListener('click', () => {
  //     const textToSpeak = document.getElementById('text-input').value;
  //     speakText(textToSpeak);
  // });
  // const handleSpeakButtonClick = (oEvent) => {
  //   // const textToSpeak = document.getElementById('text-input').value;
  //   let aiResponse = document.getElementById('output').innerText;
  //   stopSpeakText(); // stop any ongoing speech and start new one
  //   speakText(aiResponse);
    
  // }
  // const handleModelChange = (oEvent) => {
  //   setSelectedModel(oEvent.target.value);
  // }
  

  return (
    <>
    <div style={{"display": "flex", "justifyContent": "center",height: "92vh",flexWrap: "wrap"}}>
      <div className='Rightcontainer'><Rightcontent/></div>
      <div className="container">
        <CenterContent />
      </div>
      <div></div>
      </div>
    </>
  )
}

export default App
