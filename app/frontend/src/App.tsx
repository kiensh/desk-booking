import Login from './tabs/Login';
import FloorPlan from './commons/FloorPlan';
import { useUserContext } from './contexts/UserContext';
import Tabs from './commons/Tabs.tsx';
import './App.css';

function App() {
  const { user, setUser } = useUserContext();

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container">
      <h1>Desk Booking Management</h1>

      <button onClick={handleLogout} style={{ float: 'right' }}>
        Logout
      </button>

      <FloorPlan />

      <Tabs />
    </div>
  );
}

export default App;
