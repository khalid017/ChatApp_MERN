import {createContext,useEffect,useState,useContext} from 'react'
import {useNavigate} from 'react-router-dom'

//context api helps to manage state of app, puts state at top so we can fetch state directly from on single place, i.e provides a single source of truth.

const ChatContext =createContext()

const ChatProvider = ({children})=>{ //childern is whole of app

 //for making this state global pass it as prop object named value like below.

    const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([])
  const [chats, setChats] = useState();

    const navigate = useNavigate()

    useEffect(()=>{
        const userInfo = JSON.parse(localStorage.getItem("userInfo"))
        setUser(userInfo) //setting state.

        if (userInfo) 
        {
          navigate("/chats")
          console.log("chats")
        }
        else{
          navigate("/")
          console.log("home")
        }
  },[navigate]);


    return (
        <ChatContext.Provider
          value={{
            selectedChat,
            setSelectedChat,
            user,
            setUser,
            notification,
            setNotification,
            chats,
            setChats,
          }}
        >
          {children}
        </ChatContext.Provider>
      )
}
export const ChatState = () => { //exporting context
    return useContext(ChatContext);
  };
//now wrap the whole app in index.js with this chatprovider so that whatever state is defined in context will be available to whole app.

export default ChatProvider