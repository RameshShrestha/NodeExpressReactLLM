
import mongoose from 'mongoose';
const chatMessageLLMSchema = new mongoose.Schema(
  {
  
    userName: {
      type: String,
    },
    Message: {
      type: String,
    }
  },
  { timestamps: true }
);

const chatListSchemaLLM = new mongoose.Schema({

  ChatID: {
      type: mongoose.Schema.Types.UUID, // Native UUID support
      required: true
    },
    UserId : {
      type: String,
    },
    title: {
      type: String,
    },
    SystemMessage: {
      type: String,
    },
 
  children: [chatMessageLLMSchema], // Embedded array of subdocuments
} ,  { timestamps: true });

const ChatMessageLLM = mongoose.model('ChatMessageLLM', chatListSchemaLLM);

export { ChatMessageLLM };