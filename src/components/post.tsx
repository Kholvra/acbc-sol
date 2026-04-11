/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

// This is a scaffolded component — the `post` router is not yet implemented.
// All ts-ignore directives here are intentional and will be removed when the
// post router is added.

export function LatestPost() {
  // @ts-ignore — post router not implemented yet
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  // @ts-ignore — post router not implemented yet
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      // @ts-ignore — post router not implemented yet
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // @ts-ignore — post router not implemented yet
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          // @ts-ignore — post router not implemented yet
          disabled={createPost.isPending}
        >
          {/* @ts-ignore — post router not implemented yet */}
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
