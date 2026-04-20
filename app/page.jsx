// app/page.jsx
import { redirect } from "next/navigation";

export default function Home() {
  // In a real app, you'd check if a cookie exists here
  redirect("/auth/login");
}
