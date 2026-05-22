import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import RiotIdComponent, { type RiotIdFormProps } from "../../imports/RiotId/RiotId";

export default function LinkRiotPage() {
  const navigate = useNavigate();
  const { linkRiot } = useAuth();
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = riotId.trim();
    if (!trimmed.includes("#")) {
      setError("Enter your Riot ID as Name#TAG (e.g. Player#EUW).");
      return;
    }

    setLoading(true);
    try {
      await linkRiot(trimmed);
      navigate("/loading", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not link Riot ID. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formProps: RiotIdFormProps = {
    riotId,
    error,
    loading,
    onRiotIdChange: setRiotId,
    onSubmit: () => void handleSubmit(),
  };

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <RiotIdComponent form={formProps} />
    </div>
  );
}
