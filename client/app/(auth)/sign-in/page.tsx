"use client";

import LoginForm from "@/components/LoginForm";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const PageContent = () => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (data?.session && data?.user) {
    router.push(redirectTarget);
  }

  return (
    <>
      <LoginForm redirectTarget={redirectTarget} />
    </>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen">
          <Spinner />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
};

export default Page;
