/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/* tslint:disable */
"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  // @ts-ignore - post router not yet implemented
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  // @ts-ignore - post router not yet implemented
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      // @ts-ignore - post router not yet implemented
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {/* @ts-ignore - post router not yet implemented */}
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // @ts-ignore - post router not yet implemented
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
          // @ts-ignore - post router not yet implemented
          disabled={createPost.isPending}
        >
          {/* @ts-ignore - post router not yet implemented */}
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
