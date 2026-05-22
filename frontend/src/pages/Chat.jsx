import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import messageService from '../services/messageService'; // Assume service exists

const Chat = () => {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      try {
        const data = await messageService.getMessagesForUser(user.id);
        setConversations(data);
      } catch (err) {
        console.error('Error loading messages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  if (loading) return <div className="container mt-5 text-center">Cargando mensajes...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Mensajes</h2>
      {conversations.length === 0 ? (
        <p>No tienes conversaciones.</p>
      ) : (
        <ul className="list-group">
          {conversations.map((c) => (
            <li key={c.id} className="list-group-item">
              <strong>Con {c.partnerName}:</strong> {c.lastMessage}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Chat;
