import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import {useRef,useEffect} from "react"

import {
  messageMargin,
  isSameUser,
  // messageAvatar,
  isSameSender,
  isLastMessage
} from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";


const ScrollableChat = ({ messages ,messageCount,skip,setSkip}) => {
  // const messagesEndRef = useRef(null)
  
// const scrollToBottom = () => {
//   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
// }

//for scrolling to bottom of div when new msg pops.
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const  handleScroll = e => {
    let element = e.target;
    if (element.scrollTop===0) {
      if(skip+14<=messageCount)
      {
        console.log("fetched")
        setSkip((prev)=>{
          return prev+14
        })
      }
    }
 }

  const { user } = ChatState();

// messages.reverse()
// console.log(messages)
  return (
    <div style={{ overflowX: "hidden", overflowY: "scroll" }} onScroll={ handleScroll}>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" , marginLeft : (isSameSender(messages, m, i, user._id) ||
          isLastMessage(messages, i, user._id))?0 :33 }} key={m._id}>
         {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}

            {m.content &&
              <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: messageMargin(m.sender._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}>
              {m.content}
            </span>}

            {(m.file) &&

                  (m.file.substring(m.file.length-3,m.file.length)==="mp4")&& 
                  <video src={`http://localhost:5000/api/message/upload/${m.file}`} type="video/mp4" controls style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: messageMargin(m.sender._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  padding: "5px 5px",
                  maxWidth: "180px"
                  }}
                  />
                }
                    {(m.file) &&

                      (m.file.substring(m.file.length-3,m.file.length)==="pdf")&&
                       <a href={`http://localhost:5000/api/message/upload/${m.file}`} target="_blank" style={{
                        backgroundColor: `${
                          m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                        }`,
                        marginLeft: messageMargin(m.sender._id),
                        marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                        padding: "5px 5px",
                        maxWidth: "80px",
                        }}> <img src={`http://localhost:5000/api/message/upload/pdf.png`} 
                      /><span style={{display:"block", lineHeight:"15px" ,fontSize:"smaller"}}>{m.file.substring(13,m.file.length)}</span></a>}
                        
                        {(m.file)&&
                       ( (m.file.substring(m.file.length-3,m.file.length))==="png" || (m.file.substring(m.file.length-3,m.file.length))==="jpeg" || (m.file.substring(m.file.length-3,m.file.length)==="jpg" ))&&<img src={`http://localhost:5000/api/message/upload/${m.file}`} style={{
                      backgroundColor: `${
                        m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                      }`,
                      marginLeft: messageMargin(m.sender._id),
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                      padding: "5px 5px",
                      maxWidth: "180px",
                      }}
                      />}  
                        
          </div>
        ))}
          {/* <div ref={messagesEndRef} /> */}
    </div>
  );
};

export default ScrollableChat;
