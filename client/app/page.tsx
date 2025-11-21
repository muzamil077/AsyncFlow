import DashboardLayout from "@/components/layout/DashboardLayout";
import Image from "next/image";
import DashboardPage from "./dashboard/page";

export default function Home({ children }: any) {
  return (
    <>
      <DashboardPage />
    </>
  );
}
