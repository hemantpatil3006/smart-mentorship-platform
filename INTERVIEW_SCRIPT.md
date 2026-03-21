# 🗣️ Interview Demo Script

*This script is designed to help you confidently present your 1-on-1 Mentorship Platform during an interview. It guides the interviewer through a logical flow highlighting your technical decisions.*

---

## 1. The Introduction (1-2 mins)
"Hi, I'd like to show you a project I built called the **1-on-1 Mentorship Platform**. The goal was to build an ultra-low latency, real-time workspace where Mentors and Students can collaborate exactly like they would in a professional engineering environment. 

I built the frontend with **Next.js 14** and **Tailwind CSS** for a fast, modern UI. For the backend, I used **Node, Express, and Socket.io** alongside **Supabase** (PostgreSQL) for secure data persistence and Row-Level Security."

*(Open up the Homepage and log into the Mentor account)*

## 2. Session Generation & Security (2 mins)
"As a Mentor, my dashboard shows my real-time status. If I want to invite a student, I just type their email in and generate a session. 

*Technical Note:* Security is a priority here. When I create this session, **Supabase Row Level Security (RLS)** is ensuring that only this specific registered student ID and my mentor ID have the rights to view or alter this session row in the database. Anyone else trying to access it will hit a 404 wall."

*(Log into a secondary browser window as the Student. Show the dashboard popping up with the active session)*

## 3. Entering the Room: WebRTC & WebSockets (4 mins)
"Now, let's join the room as both users."

*(Click 'Join Session' on both windows. The browsers will prompt for camera/mic. Grant access.)*

"Once both users enter, three distinct real-time layers are activated:

1. **WebRTC Video (Peer-to-Peer):** We aren't routing video data through my Node server, which would crash under heavy load. Instead, the Node backend acts only as a **Signaling Server**. It passes a WebRTC Offer, Answer, and ICE candidates between our browsers using public Google STUN servers. After that handshake, our video and audio are streaming entirely Peer-to-Peer with zero latency.
2. **Socket.io Text Chat:** Unlike video, text is tiny. I wrote a custom chat panel that routes messages through Socket.io and simultaneously persists them to the Supabase `messages` table. This guarantees speed while keeping a permanent log.
3. **Monaco Shared Editor:** Here I integrated Microsoft's Monaco Editor (the same engine behind VS Code). When I type, the socket broadcasts the payload. To prevent thousands of websocket bursts a second, I implemented a `lodash.throttle` on the frontend. It operates on a 'last-write-wins' strategy—perfect for an MVP without needing the massive overhead of Operational Transformation (OT) or CRDT algorithms."

*(Demonstrate typing in the editor, and sending a chat message. Then toggle the mute/camera off and on)*

## 4. Disconnects & Cleanup (1 min)
"Finally, handling edge cases: if someone's internet drops or they close the tab, the backend socket gracefully catches the `disconnect` event, purges them from the tracked room Map, and broadcasts a `peer-disconnected` event. The UI updates instantly to show 'Waiting for video...'. 

When the session is done, the Mentor clicks 'End Call', updating the database status to `completed` and permanently revoking room access."

## 5. Summary / Q&A 
"In summary, I built a highly-scalable, real-time application balancing the strengths of WebRTC for heavy AV data, WebSockets for coordinated UI state, and PostgreSQL RLS for strict authorization.

I'd be happy to answer any questions about the socket signaling or database architecture!"
