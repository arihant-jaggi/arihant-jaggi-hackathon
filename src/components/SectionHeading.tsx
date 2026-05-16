const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-12 text-center">
    <h2 className="text-4xl font-light tracking-tight md:text-5xl">{title}</h2>
    {subtitle && <p className="mt-4 text-lg font-light text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

export default SectionHeading;
