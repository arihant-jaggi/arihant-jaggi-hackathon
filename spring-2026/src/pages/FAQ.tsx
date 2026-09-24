import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import SectionHeading from "@/components/SectionHeading";
import { useSupabaseList } from "@/hooks/useSupabaseList";

type FAQRecord = {
  id: string;
  question: string;
  answer: string;
};

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { data: faqs = [] } = useSupabaseList<FAQRecord>(["faqs"], "faqs", (query) =>
    query.order("created_at", { ascending: true }),
  );

  return (
    <PageWrapper>
      <div className="container max-w-3xl py-16 sm:py-24">
        <SectionHeading title="FAQ" subtitle="Frequently asked questions about the hackathon." />
        <div className="space-y-0">
          {faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              The FAQ section is being written. Check back soon for answers to common questions.
            </p>
          ) : (
            faqs.map((faq, index) => (
              <div key={faq.id} className="border-b">
                <button
                  onClick={() => setOpen(open === index ? null : index)}
                  className="flex w-full items-center justify-between py-4 sm:py-5 text-left"
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown size={18} className={`text-muted-foreground transition-transform shrink-0 ${open === index ? "rotate-180" : ""}`} />
                </button>
                {open === index && (
                  <p className="pb-4 sm:pb-5 text-sm font-light text-muted-foreground leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default FAQ;
