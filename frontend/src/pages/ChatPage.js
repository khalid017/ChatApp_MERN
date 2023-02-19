import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import ChatBox from '../Components/Chat/ChatBox'
import MyChats from "../Components/Chat/MyChats";
import SideDrawer from "../Components/Chat/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

 function ChatPage() {
    const[reload,setReload] = useState(false)
  const { user } = ChatState();
  function flip()
  {
     setReload(!reload)
  }
   return (
    <div style={{ width: "100%" }}>
    {user && <SideDrawer />}
    <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
      {user && <MyChats reload={reload}/>}
      {user && (
        <ChatBox reload={reload} setReload={setReload} flip={flip}/>
      )}
    </Box>
  </div>
   )
 }
 
 export default ChatPage
 