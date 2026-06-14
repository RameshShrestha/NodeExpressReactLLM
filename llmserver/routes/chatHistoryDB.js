//const express = require('express');
import express from 'express';
const router = express.Router();
import { ChatMessageLLM } from '../MongoModels/ChatMessageLLMModel.js';
import {clearCollection} from '../LLM/embedding.js';
router.route("/").get(async (req, res) => {
    //let lat = req.query.lat;
    console.log("Fetching all chat messages");
    try {
        res.setHeader('Content-Type', 'application/json');
        ChatMessageLLM.find({}).select('-children').sort({  createdAt: -1 }).then(function (chats) {
            res.send({ chats: chats });
        });
    } catch (error) {
        res.status(500).send(error);
    }
});
router.get('/:id/chatItem', async (req, res) => {
  try {
    // 1. Select ONLY the 'children' field and exclude the parent '_id'
    const doc = await ChatMessageLLM.findById(req.params.id)
                                 .select('children -_id');

    if (!doc) {
      return res.status(404).json({ message: 'Parent document not found' });
    }

    // 2. Return only the array to the client
    res.status(200).json(doc.children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/:id/chatItem', async (req, res) => {
    console.log("Adding chat item to chat ID ", req.params.id);
  try {
    const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
      req.params.id,
      { $push: { children: req.body } }, // req.body contains the child data
      { new: true, runValidators: true } // Returns updated doc and runs schema checks
    );

    if (!updatedParent) return res.status(404).json({ message: 'Parent not found' });
    res.status(201).json(updatedParent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/clear', async (req, res) => {
    console.log("Clearing chat history for chat ID ", req.params.id);
  try {
    const updatedParent = await ChatMessageLLM.findByIdAndUpdate(
      req.params.id,
      { $set: { children: [] } }, // Clear the children array
      { new: true, runValidators: true } // Returns updated doc and runs schema checks
    );
    await clearCollection(req.params.id);
    if (!updatedParent) return res.status(404).json({ message: 'Parent not found' });
    res.status(200).json(updatedParent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}); 
     

router.delete("/:chatID", async (req, res) => {
    //let lat = req.query.lat;
    let chatID =  req.params.chatID;
    console.log("Chat messages for chat ID ", chatID);
    try {
        res.setHeader('Content-Type', 'application/json');
        await ChatMessageLLM.deleteOne({ _id: chatID }).then(function (chats) {
            if(chats.deletedCount === 0){
                return res.status(404).send({ message: "Chat not found or already deleted" });
            }   
            res.send({ message: "Chat deleted successfully"  });
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.route("/:chatID").get( async (req, res) => {
    //let lat = req.query.lat;
    let chatID =  req.params.chatID;
    console.log("Chat messages for chat ID ", chatID);
    try {
        res.setHeader('Content-Type', 'application/json');
        ChatMessageLLM.find({ chatID: chatID }).select('-children').then(function (chats) {
            res.send({ chats: chats });
        });
    } catch (error) {
        res.status(500).send(error);
    }
});
router.route("/:chatID").patch( async (req, res) => {
    //let lat = req.query.lat;
    let chatID =  req.params.chatID;
    console.log("Updating chat messages for chat ID ", chatID);
    try {
        res.setHeader('Content-Type', 'application/json');
        ChatMessageLLM.findByIdAndUpdate(chatID, req.body, { new: true }).then(function (updatedChat) {
            if (!updatedChat) {
                return res.status(404).send({ message: "Chat not found" });
            }
            res.send({ updatedChat: updatedChat });
        });
    } catch (error) {
        res.status(500).send(error);
    }
});
router.route("/").post( async (req, res) => {
// New route to get chat messages by chatID
router.get("/history/:chatID", async (req, res) => {
  const { chatID } = req.params;
  try {
    const chat = await ChatMessageLLM.findOne({ ChatID: chatID }).select('-_id -__v -children -createdAt -updatedAt');
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
    const { title, UserId ,systemMessage} = req.body;
    try {
        const addChat = await ChatMessageLLM.create({
            title,
            UserId,
            SystemMessage: systemMessage || "You are a helpful assistant. Answer questions to the best of your ability.",
            ChatID: crypto.randomUUID(), // Generate a unique UUID for each chat
            children: [] // Initialize with an empty array for chat messages
        });
        const newCreatedLink = await ChatMessageLLM.findById(addChat._id);
        if (!newCreatedLink) {
            throw ("Something went wrong while adding the chat");
        }
        return res
            .status(201)
            .json({ link: newCreatedLink, message: "Chat Created Successfully" });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});
export default router;
