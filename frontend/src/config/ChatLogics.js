//they return boolean for styling purposes.

//for margin
export const messageMargin = (userId) => { //left right align
  const id = JSON.parse(localStorage.getItem("userInfo"))._id
    if (id===userId)
      return 'auto';
    else
      return 0;
  };

  export const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };
  
  //for avatar on last message
  export const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };
  

export const isSameUser = (messages, m, i) => { //for margin top of same user msgs
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};


//for showing name in msg.
export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

//for user profile modal
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};
