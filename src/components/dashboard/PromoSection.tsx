"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PromoSection() {
  return (
    <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">New Feature</h3>
            <p className="text-sm text-white/90">
              Try our QR code payment scanner for instant transactions
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="secondary"
          className="w-full bg-white text-purple-600 hover:bg-white/90"
        >
          <Link href="/scanner">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


