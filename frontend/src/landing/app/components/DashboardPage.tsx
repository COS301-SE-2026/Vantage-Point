import { useNavigate } from "react-router";
import DashboardComponent from "../../imports/Group14/Group14";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="w-screen h-screen bg-white overflow-auto">
      <DashboardComponent onLogout={handleLogout} />
    </div>
  );
}
