
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";

import { getSender, getSenderFull } from "../../config/ChatLogics";
import { useEffect, useState } from "react";
import axios, { Axios } from "axios";
import { ArrowBackIcon ,AttachmentIcon} from "@chakra-ui/icons";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "../GroupChat/UpdateGroupChatModal";
import { ChatState } from '../../Context/ChatProvider'


import io from 'socket.io-client'
var socket,selectedChatCompare
const ENDPOINT = "http://localhost:3000"
 

const SingleChat = ({ flip,reload,setReload}) => {
  const {user,selectedChat,setSelectedChat,notification, setNotification} = ChatState()

  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");//for typed msg
  const [skip, setSkip] = useState(0);

  const toast = useToast();


//for starting socket
useEffect(()=>{
  socket = io(ENDPOINT)
  //for joining room
  socket.emit("setup",user)

},[user])

  //msg typing handler
  const handler = (e)=>{
    setNewMessage(e.target.value);
  }

  //sending message handler //call fun inside effect
  //send msg socket.
  const sendMessage = async(event)=>{
    if (event.key === "Enter" && newMessage) {
        try {
          const config = {
            headers: {
              "Content-type": "application/json",
              // Authorization: `Bearer ${user.token}`,
            },
          };
          setNewMessage("");
          //sending msg to api
          const { data } = await axios.post( //creating new msg
            "/api/message",
            {
              content: newMessage,
              chatId: selectedChat,
            },
            config
          );
          //emitting send msg event with data=msg content and chat ki id
          socket.emit("send message", data)
          setMessages([...messages, data])//updating msg state
          flip()

        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          })
        }
      }
    }


    //For pagination
    useEffect(()=>{
      scrollFeed(skip)
    },[skip]);


    //fetching old chats for pagination.
    const scrollFeed = async (skip) => {
      if (!skip) return;
  
      try {
        setLoading(true);
  
        const { data } = await axios.get(
          `/api/message/?id=${selectedChat._id}&skip=${skip}`
        );

        setMessages((prev)=>{
          return[...data.messages.reverse(),...prev]
        }) //updating state with all messeges.
        //console.log(messages)
       
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    };

    const postFile = async(files)=>{
      const file = files[0]
      if(file===undefined)
      {
        return;
      }

      console.log(file)

      
   try {
    let formData = new FormData
    const  config = {
      header :{ "content-type":"multipart/form-data"}
      }
      formData.append("file",file)

     var fData = await axios.post('api/message/upload/0',formData,config)

     let fileData =fData.data
     console.log(fileData)
     

     var { data } = await axios.post( //creating new msg
     "/api/message",
     {
       file:fileData,
       chatId: selectedChat,
     },
     {header:{"content-type":"application/json"}}
   );
   //console.log(data)
   socket.emit("send message", data)
   setMessages([...messages, data])//updating msg state
   flip()
   } catch (error) {
    toast({
      title: "Error Occured!",
      description: "Failed to send the Message",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    })
   }

  }



    //fetching all messeges of a chat handler
    //socket for joining chat
    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
          setLoading(true);
    
          const { data } = await axios.get(
            `/api/message/?id=${selectedChat._id}&skip=0`
          );
          setMessageCount(data.count)
          setMessages(data.messages.reverse()) //reversing coz msgs received in newest to oldest order.
          //console.log(messages)
         
          setLoading(false);
          socket.emit("join chat", selectedChat._id);

        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Messages",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      };

//effect to get all msgs when chat selected
      useEffect(()=>{
        setSkip(0) //reseting skip to 0 when chat changed.
        fetchMessages()
    selectedChatCompare = selectedChat;
      },[selectedChat]);

      // useEffect(()=>{
      //   socket.on("file received",(file)=>{
      //     var f = new Blob([file]);
      //     console.log("received")
      //     // setMessages([...messages,file])
      //   })
      // })


      //receving msg from server through socket and reloading my chats
      useEffect(()=>{
        socket.on("message received",(receivedMessage)=>{
          //console.log(receivedMessage)
          if (!selectedChatCompare || (receivedMessage.chat._id !== selectedChatCompare._id) ){
            if(!notification.includes(receivedMessage))
            setNotification([receivedMessage,...notification])
            flip()
          } else {
            setMessages([...messages, receivedMessage]);
            flip()
          }
        });
          
      })

  return  <>
  {selectedChat ? (
    <>
      <Text
        fontSize={{ base: "28px", md: "30px" }}
        pb={3}
        px={2}
        w="100%"
        fontFamily="Work sans"
        display="flex"
        justifyContent={{ base: "space-between" }}
        alignItems="center"
      >
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat("")}
        />
   {messages &&
              (!selectedChat.isGroupChat ? ( // if not group chat then user profile modal, else group edit modal.
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    reload={reload}
                    setReload={setReload}
                  />
                </>
              ))}
      </Text>

      {/* box where chat spans are loaded(scollable) below name and profile modal */}
      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        p={3}
        bg="#E8E8E8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {/* if messags loading */}
        {loading ? (
          <Spinner
            size="xl"
            w={20}
            h={20}
            alignSelf="center"
            margin="auto"
          />
        ) : ( 
            // else load scrollable chat with user
          <div className="messages">
            <ScrollableChat messages={messages} messageCount={messageCount} skip={skip} setSkip={setSkip}/>
          </div>
        )}

        <div style={{display:"flex" ,alignItems:"center"}}>
        <FormControl
          onKeyDown={sendMessage}
          id="first-name"
          isRequired
          float="left"
          mt={3}
        >
          <Input
            variant="filled"
            width="98%"
            bg="#E0E0E0"
            placeholder="Enter a message.."
            onChange={handler}
            value={newMessage}
          />
        </FormControl>
        <FormControl width="30px">
          <label htmlFor="file-upload">
          <AttachmentIcon/>
          </label>
        <Input type="file" accept="image/* ,video/mp4 ,application/pdf" id="file-upload" style={{display:"none"}} onChange={(e)=> postFile(e.target.files)}/>
        </FormControl>
        </div>
      </Box>
    </>
  ) : (
    //no user seleted to chat
    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
      <Text fontSize="3xl" pb={3} fontFamily="Work sans">
        Click on a user to start chatting.
      </Text>
    </Box>
  )}
</>

}

export default SingleChat
