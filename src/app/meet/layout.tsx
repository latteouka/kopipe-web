const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      {children}
    </div>
  );
};
export default Layout;
