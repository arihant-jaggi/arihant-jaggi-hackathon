import { User } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { useSupabaseList } from "@/hooks/useSupabaseList";

type JudgeRecord = {
  id: string;
  name: string;
  title?: string | null;
  role?: string | null;
  description?: string | null;
  type?: string | null;
};

const Judges = () => {
  const { data: judges = [] } = useSupabaseList<JudgeRecord>(["judges"], "judges_mentors", (query) =>
    query.order("created_at", { ascending: true }),
  );

  return (
    <PageWrapper>
      <div className="container py-16 sm:py-24">
        <SectionHeading title="Judges & Mentors" subtitle="Our panel of experts will be announced soon. Stay tuned!" />
        {judges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">We’re still inviting judges and mentors. Their details will appear here shortly.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {judges.map((judge) => (
              <div key={judge.id} className="border bg-card p-6 sm:p-8 transition-colors hover:border-primary/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border bg-secondary flex items-center justify-center mb-5">
                  <User size={28} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium tracking-tight">{judge.name}</h3>
                <p className="text-sm text-primary font-mono">{judge.role ?? judge.title}</p>
                <p className="text-xs font-light text-muted-foreground mt-1">{judge.description}</p>
                <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed">{judge.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Judges;
