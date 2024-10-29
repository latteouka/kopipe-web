export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="bg-white">{children}</div>;
}
