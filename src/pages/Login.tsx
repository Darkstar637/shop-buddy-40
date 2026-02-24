import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPin, setAuthenticated } from "@/lib/store";
import { Lock } from "lucide-react";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === getPin()) {
      setAuthenticated(true);
      navigate("/");
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">RentManager</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(false); }}
            placeholder="Enter PIN"
            className="w-full text-center text-2xl tracking-[0.5em] bg-card border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base"
            autoFocus
          />
          {error && <p className="text-destructive text-sm text-center">Incorrect PIN</p>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Unlock
          </button>
          <p className="text-muted-foreground text-xs text-center">Default PIN: 1234</p>
        </form>
      </div>
    </div>
  );
}
