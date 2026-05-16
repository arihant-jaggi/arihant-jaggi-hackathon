import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { CheckCircle } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/venue"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PageWrapper>
      <div className="container max-w-xl py-32 text-center space-y-6">
        <CheckCircle className="mx-auto text-primary" size={64} strokeWidth={1.5} />
        <h1 className="text-3xl sm:text-4xl font-display font-light">Thank You!</h1>
        <p className="text-muted-foreground font-light text-lg">
          We have recorded your details. You'll hear from us soon!
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">
          Redirecting to venue details in 5 seconds…
        </p>
        <button
          onClick={() => navigate("/venue")}
          className="border px-6 py-2.5 text-sm font-light text-foreground hover:border-primary transition-colors"
        >
          Go to Venue Now
        </button>
      </div>
    </PageWrapper>
  );
};

export default ThankYou;
