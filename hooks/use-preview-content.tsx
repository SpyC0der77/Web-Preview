import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const code = `"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>shadcn/ui Demo</CardTitle>
          <CardDescription>
            A simple page.tsx showing a few basic components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" placeholder="Jane Doe" />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => alert("Primary action clicked")}
              >
                Primary action
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => alert("Secondary action clicked")}
              >
                Secondary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}`;

function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>shadcn/ui Demo</CardTitle>
          <CardDescription>
            A simple page.tsx showing a few basic components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" placeholder="Jane Doe" />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => alert("Primary action clicked")}
              >
                Primary action
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => alert("Secondary action clicked")}
              >
                Secondary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function usePreviewContent() {
  return { component: Page, code };
}
