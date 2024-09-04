import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Meet Link",
  description: "Beyond one hour ❤️",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      {children}
    </div>
  );
};
export default Layout;
