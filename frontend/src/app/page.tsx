import { redirect } from "next/navigation";

// Root redirects to /assignments
export default function RootPage() {
  redirect("/assignments");
}
