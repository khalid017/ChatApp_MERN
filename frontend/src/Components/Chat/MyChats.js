import { Box, Stack, Text } from "@chakra-ui/layout";
import { AddIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/toast";
import { Button } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import { ChatState } from "../../Context/ChatProvider";
import GroupChatModal from "../GroupChat/GroupChatModal"

const MyChats = ({reload}) => {
  // const [loggedUser, setLoggedUser] = useState();//local state
  
  const { selectedChat, setSelectedChat, user, chats, setChats, setNotification , notification,} = ChatState(); //context state
  
  //selected chat-> for styling 
  //chats-> all chats for displaying in my chats

  const toast = useToast();

  const fetchChats = async () => { //all chats of logged in user.
    // console.log(user._id);

    try {
    
      const { data } = await axios.get("/api/chat");
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

//calling the api inside useeffect
  useEffect(() => {
    // setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();

  }, [reload]); //for re fetching chat to update latest msg .

  //for displaying chats
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }} // for making display flexible
      flexDir="column"
      alignItems="center"
      p={3}
      bg="lightgray"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
        {/* header of chat */}
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      {/* for displaying all chats */}
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {/* if chat present map and render else loading */}
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={ 
                  ()=>{
                    notification.map((notif) =>{
                      setNotification(notification.filter((n) => n.chat._id !== notif.chat._id))
                    })
                    setSelectedChat(chat)
                  }
                }
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                {/* for dislplay user name in chats */}
                <Text>
                {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </Text>

                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name}</b>
                    {chat.latestMessage.content?
                     chat.latestMessage.content.length > 50
                     ? chat.latestMessage.content.substring(0, 51) + "..."
                     : chat.latestMessage.content
                    :chat.latestMessage.file.substring(13,chat.latestMessage.file.length)}
                   
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;