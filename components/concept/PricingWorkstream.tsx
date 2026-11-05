function Soon({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-dark bg-white px-5 py-10 text-center">
      <p className="p6 text-text-primary">{label} — coming soon</p>
      <p className="mt-1 p6 text-text-secondary">
        Placeholder for the customer {label.toLowerCase()} view.
      </p>
    </div>
  );
}

export function PricingPanel() {
  return <Soon label="Pricing" />;
}

export function ContractPanel() {
  return <Soon label="Contract" />;
}
