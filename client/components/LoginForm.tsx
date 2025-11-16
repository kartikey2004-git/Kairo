"use client";
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { authClient } from "@/lib/auth-client";
import { Github } from "lucide-react";

const LoginForm = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10 bg-linear-to-b from-[#0f0f14] to-[#14141c]">
      {/* Hero */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight bg-linear-to-r from-indigo-400 to-violet-400 text-transparent bg-clip-text">
          Welcome Back
        </h1>

        <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
          Sign in to continue and connect your device flow with{" "}
          <span className="text-indigo-300 font-medium">Kairo CLI</span>
        </p>
      </div>

      {/* Card */}
      <Card className="w-full max-w-md mt-10 bg-[#1b1b23]/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col gap-5">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium border-indigo-500/40  transition-all"
              onClick={() =>
                authClient.signIn.social({
                  provider: "github",
                  callbackURL: "http://localhost:3000",
                })
              }
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
