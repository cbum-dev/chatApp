import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_USERS,
} from "../appwriteConfig";
import { ID, Query, Permission, Role } from "appwrite";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";

const New = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    getNew();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_USERS}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          console.log("A MESSAGE WAS CREATED");
          setUsers((prevState) => [response.payload, ...prevState]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterMessages();
  }, [users, searchTerm]);

  const getNew = async () => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_USERS,
      [
        Query.orderDesc("$createdAt"),
        // Query.notEqual('user',user.$id)
      ]
    );
    console.log(response.documents);
    // console.log(user.u)
    setUsers(response.documents);
  };

  const filterMessages = () => {
    const filtered = users.filter((message) => {
      return message.username.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredMessages(filtered);

    // Filter messages where message.user === user.$id
    const userSpecificMessages = users.filter(
      (message) => message.user === user.$id
    );
    setUserMessages(userSpecificMessages);
  };

  const handleChatButtonClick = (messageId) => {
    navigate(`/chat/${messageId}`);
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <div>
          {userMessages.map((message) => (
            <div key={message.$id} className={"message--wrapper"}>
              <div className="message--header">
                <p>
                  {message.user ? <span>Your Chat</span> : "Anonymous user"}
                </p>
              </div>
              <button
                className="chat-button"
                onClick={() => handleChatButtonClick(message.$id)}
              >
                See Your Chat
              </button>
            </div>
          ))}
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
                  {message.user ? (
                    <span>{message.username}</span>
                  ) : (
                    "Anonymous user"
                  )}
                </p>
              </div>
              <button
                className="chat-button"
                onClick={() => handleChatButtonClick(message.$id)}
              >
                {message.username === user.name ? "See your chat" : "Chat"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default New;
