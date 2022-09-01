import { useEffect, useState } from 'react';
import { useWebRTCFirebase } from 'usewebrtc';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { v4 as uuid } from 'uuid';
import './App.css';

const participantId = uuid();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const db = getFirestore(initializeApp(firebaseConfig));


function App() {
  const [joinedRoom, setJoinedRoom] = useState(false);
  /* eslint-disable no-unused-vars */
  const {
      localStream,
      participants,
      shareScreen,
      endScreenShare,
      createRoom,
      joinRoom,
      leaveRoom,
      roomId,
      setRoomId,
  } = useWebRTCFirebase({ db, participantId });
  /* eslint-enable no-unused-vars */

  useEffect(() => {
    if (!roomId) {
      setJoinedRoom(false);
    }
  }, [roomId]);

  return (
    <div className="App">
      <div>
        <video
          ref={(element) => {
            if (element) {
              element.srcObject = localStream;
            }
          }}
          autoPlay
          playsInline
          className="local"
          muted
        />
        {participants.map(({ id, stream }) => {
          return <div key={id}>
            <h1>{id}:</h1>
            <video ref={(element) => {
              if (element) {
                element.srcObject = stream;
              }
            }} key={id} autoPlay playsInline className="remote" />
          </div>
        })}
      </div>
      {!roomId &&
        <>
          <button
              onClick={async () => {
                try {
                  await createRoom();
                  setJoinedRoom(true);
                } catch(e) {
                  console.error(e);
                  alert('Failed to create room,', e.message);
                }
              }}
          >CREATE ROOM</button>
      </>}
      <div className="answer box">
        {!joinedRoom &&
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Join with code"
          />
        }
        <button onClick={async () => {
          try {
            await joinRoom();
            setJoinedRoom(true);
          } catch (e) {
            console.error(e);
            alert(e.message);
          }
        }}>JOIN ROOM</button>
      </div>
      {roomId && <>
        <div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
            }}
          >
            Copy joining code
          </button>
          <p>Room: {roomId} <br/> Participant ID: {participantId}</p>
          <button onClick={async () => {
            // shareScreen({ options: { suppressVideo: true } });
            shareScreen();
          }}>SHARE SCREEN</button>
        </div>
      </>}
    </div>
  );
}

export default App;
