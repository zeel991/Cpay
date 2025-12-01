"use client";

import Link from "next/link";
import { ArrowRight, Wallet, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-6xl px-4 py-16 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 lg:text-6xl">
            Welcome to <span className="text-blue-600">Cpay</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 lg:text-2xl">
            Your secure, seamless crypto payment solution
          </p>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Open Wallet
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-lg transition-transform hover:scale-105">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              Easy Wallet Management
            </h3>
            <p className="text-gray-600">
              Manage your crypto assets with an intuitive and user-friendly interface.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg transition-transform hover:scale-105">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              Secure & Safe
            </h3>
            <p className="text-gray-600">
              Built with security in mind using ZeroDev and embedded wallets for maximum protection.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg transition-transform hover:scale-105">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Experience instant transactions with optimized blockchain technology.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-lg opacity-90">
            Create your wallet and start managing your crypto assets today.
          </p>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 transition-all hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}