import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';
import { VideoCallProvider } from './contexts/VideoCallContext.jsx';
import { GroupProvider } from './contexts/GroupContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {' '}
      <SocketProvider>
        <ChatProvider>
          <VideoCallProvider>
            {' '}
            <GroupProvider>
              <App />{' '}
            </GroupProvider>
          </VideoCallProvider>{' '}
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
