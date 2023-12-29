import React, { useState, useEffect } from "react";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_PRIVATEMESSAGES,
  COLLECTION_ID_USERS,
} from "../appwriteConfig";
import { ID, Query, Permission, Role } from "appwrite";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";
import { Trash2 } from "react-feather";

const Chatting = () => {
  const [messageBody, setMessageBody] = useState("");
  const [messag, setMessag] = useState([]);
  const [users, setUSers] = useState([]); // Added state for 'neww'
  const { user } = useAuth();
  const messageId = useParams();
  let val = 0;
  let id = 0;

  useEffect(() => {
    getUsers(); 
    getMessag();
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_PRIVATEMESSAGES}.documents`,
      (response) => {
        getMessag();
      }
    );

    console.log("unsubscribe:", unsubscribe);

    return () => {
      unsubscribe();
    };
  }, [user]);

  const getUsers = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_USERS,
        [Query.equal("user", user.$id)]
      );

      console.log(response.documents);
      setUSers(response.documents);
      val = response.documents[0].$id;
      id = response.documents[0].user;
      getMessag();

      // console.log(response.documents[0].user)
    } catch (error) {
      console.error("Error fetching neww documents:", error);
      // Handle errors as needed
    }
  };

  const getMessag = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_PRIVATEMESSAGES,

        [
          Query.equal('users_by' , [val,messageId.messageId]),

          Query.equal("users", messageId.messageId),
          // Query.equal('new_by',[val]),
          Query.orderDesc("$createdAt"),
        ]
      );
      // console.log(val)
      if (user.$id === id) {
        console.log(true);
        console.log(id, user.$id);
      }
      console.log(response.documents);
      console.log(messageId.messageId);
      setMessag(response.documents);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await getUsers();
    console.log("MESSAGE:", messageBody);

    const permissions = [Permission.write(Role.user(user.$id))];
    const existingUserId = messageId.messageId;
    const existingUserbyId = val;
    console.log(existingUserbyId);
    const payload = {
      message: messageBody,
      users: existingUserId,
      users_by: existingUserbyId,
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID_PRIVATEMESSAGES,
      ID.unique(),
      payload,
      permissions
    );

    console.log("RESPONSE:", response);

    // setMessages(prevState => [response, ...prevState])

    setMessageBody("");
  };
  const handleDelete = async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_PRIVATEMESSAGES, id);
  };
  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form id="message--form" onSubmit={handleSubmit}>
          {/* ... (other form elements) */}
          <div>
            <textarea
              required
              maxLength="250"
              placeholder="Say something..."
              onChange={(e) => {
                setMessageBody(e.target.value);
              }}
              value={messageBody}
            ></textarea>
          </div>

          <div className="send-btn--wrapper">
            <input className="btn btn--secondary" type="submit" value="send" />
          </div>
        </form>
        <div>
          {messag.map((message) => (
            <div key={message.$id} className={"message--wrapper"}>
              <div className="message--header">
              <p>
                {message?.users_by ? (
                  <span> {message.users_by.username}</span>
                ) : (
                  "Anonymous user"
                )}

                <small className="message-timestamp">
                  {" "}
                  {new Date(message.$createdAt).toLocaleString()}
                </small>
              </p>
              {message.users_by.user === user.$id && (
                <Trash2
                  className="delete--btn "
                  onClick={() => handleDelete(message.$id)}
                />
              )}
              </div>
              <div
                className={
                  "message--body" +
                  (message.users_by.user === user.$id
                    ? " message--body--owner"
                    : "")
                }
              >
                <span>{message.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Chatting;
