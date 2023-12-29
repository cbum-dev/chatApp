import React, { useState, useEffect } from "react";
import client, { databases, DATABASE_ID, COLLECTION_ID_MESSAGING, COLLECTION_ID_NEW } from "../appwriteConfig";
import {ID, Query,Permission,Role } from "appwrite";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";

const Chatting = () => {
    const [messageBody, setMessageBody] = useState('')
    const [messag, setMessag] = useState([]);
    const [neww, setNeww] = useState([]); // Added state for 'neww'
    const { user } = useAuth();
    const messageId = useParams()
    let val = 0
    let id = 0;

    useEffect(() => {
        getNew(); // Call the function to fetch 'neww' data

        const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGING}.documents`, response => {
            // Handle real-time updates for COLLECTION_ID_MESSAGING if needed
        });

        console.log('unsubscribe:', unsubscribe);

        return () => {
            unsubscribe();
        };
    }, [user]);

    const getNew = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_NEW,
                [
                    Query.equal('user',user.$id)
                ]
            );

            console.log(response.documents);
            setNeww(response.documents);
            val = response.documents[0].$id;
            id = response.documents[0].user;
            // console.log(val.toString())
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
                COLLECTION_ID_MESSAGING,
                
                [
                    Query.equal('new', messageId.messageId),
                    // Query.equal('new_by',[val]),
                    Query.orderDesc('$createdAt')
                    // Query.equal('new_by' , '6587e150103bc459133c')
                ],
                

            );
            // console.log(val)
            if (user.$id===id) {
            console.log(true)
            console.log(id,user.$id)
                
            }
            console.log(response.documents);
            console.log(messageId.messageId)
            setMessag(response.documents);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault()
        await getNew();
        console.log('MESSAGE:', messageBody)

        const permissions = [
            Permission.write(Role.user(user.$id)),
          ]
          const existingNewId = messageId.messageId;
          const existingNewbyId = val;
          console.log(existingNewbyId)
          const payload = {
            message: messageBody,
            new: existingNewId,
            new_by: existingNewbyId, 
        };
    

        const response = await databases.createDocument(
                DATABASE_ID, 
                COLLECTION_ID_MESSAGING, 
                ID.unique(), 
                payload,
                permissions
            )

        console.log('RESPONSE:', response)

        // setMessages(prevState => [response, ...prevState])

        setMessageBody('')

    }
    return (
        <main className="container">
            <Header/>
            <div className="room--container">
            <form id="message--form" onSubmit={handleSubmit}>
            <div>
                <textarea 
                    required 
                    maxLength="250"
                    placeholder="Say something..." 
                    onChange={(e) => {setMessageBody(e.target.value)}}
                    value={messageBody}
                    ></textarea>
            </div>

            <div className="send-btn--wrapper">
                <input className="btn btn--secondary" type="submit" value="send"/>
            </div>
        </form>
            <div>
                {messag.map(message => (
                    <div key={message.$id} className={"message--wrapper"}>
                        <div className="message--header">
                            <p> 
                                {message?.user ? (
                                    <span> {message.username}</span>
                                ): (
                                    'Anonymous user'
                                )}
                             
                                <small className="message-timestamp"> {new Date(message.$createdAt).toLocaleString()}</small>
                                {message.$id}
                            </p>
                        </div>
    
                        <div className={"message--body" + (id.toString() === user.$id.toString() ? ' message--body--owner' : '')}>
                            <span>{message.message}</span>
                            {/* <p>as</p> */}
                            
                        </div>                    </div>
                        
                ))}
            </div>
            </div>
            
        </main>
      )
};

export default Chatting;
