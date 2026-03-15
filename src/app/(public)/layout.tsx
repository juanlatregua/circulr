import { AsesorIA } from "@/components/shared/AsesorIA";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AsesorIA />
    </>
  );
}
