"use client";
import PublicCard from "../components/PublicCard";
import { use } from "react";

type Props = {
  params: Promise<{ username: string }>;
};

export default function CardPage({ params }: Props) {
 const { username } = use(params)
   return <PublicCard username={username} />;
}
