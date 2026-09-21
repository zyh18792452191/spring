export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
