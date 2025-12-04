export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5 px-4 py-12">
      {children}
    </div>
  );
}

