"use client";

import { api } from "~/trpc/react";

export default function Home() {
  const hello = api.post.findMany.useQuery();
  console.log(hello.data?.posts);

  return <main className="container">sdfsdf</main>;
}
