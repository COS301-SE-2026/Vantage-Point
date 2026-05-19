import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import DashboardComponent from "../../imports/Group14/Group14";
import MatchDetailModal from "./MatchDetailModal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const matchFromUrl = searchParams.get("match");

  useEffect(() => {
    if (matchFromUrl) {
      setSelectedMatchId(matchFromUrl);
    }
  }, [matchFromUrl]);

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

  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedMatchId(null);
        const next = new URLSearchParams(searchParams);
        next.delete("match");
        setSearchParams(next, { replace: true });
      }
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="w-screen h-screen bg-white overflow-auto">
      <DashboardComponent
        onLogout={handleLogout}
        onMatchSelect={handleMatchSelect}
      />
      <MatchDetailModal
        matchId={selectedMatchId}
        open={selectedMatchId !== null}
        onOpenChange={handleModalOpenChange}
      />
    </div>
  );
}
