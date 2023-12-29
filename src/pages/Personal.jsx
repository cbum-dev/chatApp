import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client, { databases, DATABASE_ID, COLLECTION_ID_NEW } from "../appwriteConfig";
import { ID, Query, Permission, Role } from "appwrite";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";

const New = () => {
  const [neww, setNeww] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  let myId = 0;
  useEffect(() => {
    getNew();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_NEW}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          console.log("A MESSAGE WAS CREATED");
          setNeww((prevState) => [response.payload, ...prevState]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   filterMessages();
  // }, [neww, searchTerm]);

  const getNew = async () => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_NEW, 
    [
      Query.orderDesc("$createdAt"),
        // Query.notEqual('user',user.$id)
  ]);
    console.log(response.documents);
    setNeww(response.documents);
  };

  // const filterMessages = () => {
  //   const filtered = neww.filter((message) => {
  //     return message.username.toLowerCase().includes(searchTerm.toLowerCase());
  //   });
  //   setFilteredMessages(filtered);

  //   // Filter messages where message.user === user.$id
  //   const userSpecificMessages = neww.filter((message) => message.user === user.$id);
  //   setUserMessages(userSpecificMessages);
  // };

  const handleChatButtonClick = (messageId) => {
    navigate(`/chat/${messageId}`);
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <div>
          {/* {userMessages.map((message) => (
            <div key={message.$id} className={"message--wrapper"}>
              <div className="message--header">
                <p>
                  {message.user ? <span> {message.username}</span> : "Anonymous user"}
                  <small className="message-timestamp"> {new Date(message.$createdAt).toLocaleString()}</small>
                  <p>{message.$id}</p>
                </p>
              </div>
              <div className={"message--body" + (message.user === user.$id ? " message--body--owner" : "")}>
                <span>{message.body}</span>
              </div>
              <button className='chat-button'onClick={() => handleChatButtonClick(message.$id)}>Chat</button>
            </div>
          ))} */}
          <input
            type="text"
            placeholder="Search by username"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          {filteredMessages.map((message) => (
            <div key={message.$id} className={"message--wrapper"}>
              <div className="message--header">
                <p>
                  {message.user ? <span> {message.username}</span> : "Anonymous user"}
                </p>
              </div>
              <button className="chat-button" onClick={() => handleChatButtonClick(message.$id)}>Chat</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default New;
