export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-warm opacity-30 blur-3xl animate-float" />
      <div
        className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-gradient-cool opacity-30 blur-3xl animate-float"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-25 blur-3xl animate-float"
        style={{ background: "var(--gradient-brand)", animationDelay: "-6s" }}
      />
    </div>
  );
}
