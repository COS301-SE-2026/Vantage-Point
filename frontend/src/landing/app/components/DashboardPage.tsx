import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import DashboardComponent, {
  type DashboardView,
} from "../../imports/Group14/Group14";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("matches");

  const matchFromUrl = searchParams.get("match");
  const viewFromUrl = searchParams.get("view");

  useEffect(() => {
    if (matchFromUrl) {
      setSelectedMatchId(matchFromUrl);
    } else {
      setSelectedMatchId(null);
    }
  }, [matchFromUrl]);

  useEffect(() => {
    if (viewFromUrl === "profile") {
      setActiveView("profile");
    } else if (viewFromUrl === "matches") {
      setActiveView("matches");
    }
  }, [viewFromUrl]);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleMatchSelect = useCallback(
    (matchId: string) => {
      setSelectedMatchId(matchId);
      setSearchParams({ match: matchId }, { replace: true });
    },
    [setSearchParams]
  );

  const handleMatchBack = useCallback(() => {
    setSelectedMatchId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("match");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="w-screen h-screen bg-white overflow-auto">
      <DashboardComponent
        activeView={activeView}
        onLogout={handleLogout}
        onMatchSelect={handleMatchSelect}
        selectedMatchId={selectedMatchId}
        onMatchBack={handleMatchBack}
        onProfileClick={() => setActiveView("profile")}
        onDashboardClick={() => setActiveView("matches")}
      />
    </div>
  );
}
