import { io } from 'socket.io-client';
const token = localStorage.getItem('accessToken');
const socket = io('http://localhost:5000', {
  auth: { token: token },
});

socket.on('connect', () => {
  console.log('✅ Manual connection successful!');
});

export default function SocketTest() {
  socket();
  return <></>;
}
