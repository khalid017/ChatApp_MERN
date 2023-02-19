import React from 'react'
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon,ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NotificationBadge from "react-notification-badge"
// import { Effect } from "react-notification-badge";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "./ChatLoading"
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import UserListItem from "../UserAvatar/UserListItems";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
    const [search, setSearch] = useState("");//for search input
    const [searchResult, setSearchResult] = useState([]);// search result users.
    const [loading, setLoading] = useState(false);//for skeleton loading
    const [loadingChat, setLoadingChat] = useState(false);//for spinner loading
    const {
      setSelectedChat,
      user,
      notification,
      setNotification,
      chats,
      setChats,
    } = ChatState();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure(); //chakra custom hook for open closing like control of components.
    const navigate = useNavigate()
    //loggin out
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        setSelectedChat("")
        navigate("/")
      };

    //search functionality
    const handleSearch = async () => {
        if (!search) {
          toast({
            title: "Please Enter something in search",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          });
          return;
        }
    //for making api requests...
        try {
          setLoading(true);//search started
    
          const { data } = await axios.get(`/api/user?search=${search}`);//making api call with header.
    
          setLoading(false);
          setSearchResult(data); //updating state with search result, i.e searched users other than current current

        } catch (error) {

          toast({
            title: "Error Occured!",
            description: "Failed to Load the Search Results",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      };

      //making or accesing chat with user
      const accessChat = async (user) => { //userId = id of other user than logged user.
        //console.log(userId);
    
        try {
          setLoadingChat(true);
          //taking json data so set header
          const config = {
            headers: {
              "Content-type": "application/json",
            },
          };
          //hitting end point for creating/accessing chat
          const { data } = await axios.post(`/api/chat`, { user }, config);
    
          if (!chats.find((c) => c._id === data._id )) 
          //if chat already exists we'll append new created chat to the existing state by updating the state like below.
          setChats([data, ...chats]);

          setSelectedChat(data);
          setLoadingChat(false);
          onClose();
        } catch (error) {
          toast({
            title: "Error fetching the chat",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      };

  return (<>
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    bg="lightblue"
    w="100%"
    p="5px 10px 5px 10px"
    borderWidth="5px"
  >
    <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
      <Button variant="ghost" onClick={onOpen}>
        <i className="fas fa-search"></i>
        <Text d={{ base: "none", md: "flex" }} px={4}>
          Search User
        </Text>
      </Button>
    </Tooltip>
    <Text fontSize="2xl" fontFamily="Work sans">
      Whatsapp
    </Text>
    <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={[null, null, null, null]}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n.chat._id !== notif.chat._id));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
    
      <Menu>
        <MenuButton as={Button} bg="FFE5F1" rightIcon={<ChevronDownIcon />}>
          <Avatar
            size="sm"
            cursor="pointer"
            name={user.name}
            src={user.pic}
          />
        </MenuButton>
        <MenuList>
          <ProfileModal user={user}>
            <MenuItem>My Profile</MenuItem>{" "}
          </ProfileModal>
          <MenuDivider />
          <MenuItem onClick={logoutHandler}>Logout</MenuItem>
        </MenuList>
      </Menu>
      </div>
  </Box>

  {/* for serching user- drawer */}
  <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
    <DrawerOverlay />
    <DrawerContent>
      <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
      <DrawerBody>
        <Box d="flex" pb={2}> 
        {/* for search input */}
          <Input
            placeholder="Search by name or email"
            mr={2}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleSearch}>Go</Button>
        </Box>
{/* 
        if loading, then loading things else dislplay result */}
        {loading ? (
            // using stack of skeleton components for loading component
          <ChatLoading />
        ) : (
            //populating using api returned data
          searchResult?.map((user) => (
            <UserListItem
              key={user._id}
              user={user}
              handleFunction={() => accessChat(user)}
            />
          ))
        )}
        {loadingChat && <Spinner ml="auto" d="flex" />}
      </DrawerBody>
    </DrawerContent>
  </Drawer>
</>
);

}

export default SideDrawer
