import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("James");

  useEffect(() => {
    console.log("Adding push event listener to simple page.");
    window.addEventListener("push", (e: any) => {
      console.log(e);
      console.log("Push event.");
    });
  }, []);

  const storeSubscription = async () => {
    try {
      const res = await axios.post("https://localhost:44325/home", {
        client: name,
        endpoint: window.localStorage.getItem("endpoint"),
        p256dh: window.localStorage.getItem("p256dh"),
        auth: window.localStorage.getItem("auth"),
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  const sendPush = async () => {
    try {
      const res = await axios.post("https://localhost:44325/notify", {
        client: name,
        message: "Hello, here's a push notification.",
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <p>Hello World!</p>

      <h1>Subscribe to Push Notifications</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <button onClick={storeSubscription}>Store sub details</button>
      <button onClick={sendPush}>Send Push</button>
    </>
  );
}

export default App;
