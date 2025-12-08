'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useEditAuth } from '@/providers/EditAuthProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trophy, Users, Gavel, RotateCcw } from 'lucide-react';

export default function Home() {
  const { isEditable } = useEditAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all data? This will delete all players and teams and restore the initial seeded data. This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setIsResetting(true);
      const response = await fetch('/api/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Database reset successfully! All data has been restored to the initial state.');
        window.location.reload();
      } else {
        alert('Failed to reset database. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Error resetting database. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500">Powered by</span>
          <Image
            src="/images/iotric.webp"
            alt="iotric"
            width={120}
            height={40}
          />
        </div>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {/* <Trophy className="w-20 h-20 text-yellow-500" /> */}
            <Image
              src="/images/logo.jpg"
              alt="iotric"
              width={240}
              height={80}
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SCL-2026 Auction
          </h1>
          <p className="text-xl text-gray-600">
            Cricket Player Auction Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link href="/players">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10 text-blue-500" />
                  <div>
                    <CardTitle>Players</CardTitle>
                    <CardDescription>Manage player database</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View, add, and manage players across all categories: Legend,
                  Youngstar, Gold, Silver, and Bronze.
                </p>
                <Button className="mt-4 w-full">View Players</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/auction">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Gavel className="w-10 h-10 text-green-500" />
                  <div>
                    <CardTitle>Team Auction</CardTitle>
                    <CardDescription>Manage team auctions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Conduct auctions, assign players to teams, and track team
                  budgets and category limits.
                </p>
                <Button className="mt-4 w-full">Start Auction</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Auction Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Team Composition</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>Total Teams: 7</li>
                    <li>Team Purse: 2 Crores</li>
                    <li>Min Players: 13</li>
                    <li>Max Players: 13</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Category Limits</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>Legend: 1 player</li>
                    <li>Youngstar: 1 player</li>
                    <li>Gold: 2 players (required)</li>
                    <li>Silver: 5 players (required)</li>
                    <li>Bronze: 4 players (required)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Minimum Bid Amounts</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>Gold: 15 Lakhs</li>
                    <li>Silver: 10 Lakhs</li>
                    <li>Others: 5 Lakhs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Teams</h4>
                  <ul className="space-y-1 text-gray-600 text-xs">
                    <li>Gujarat Lions</li>
                    <li>Chhava Sena</li>
                    <li>Team Lagaan</li>
                    <li>Pratham 11</li>
                    <li>Yohan&apos;s Warriors</li>
                    <li>Khalsa Warriors</li>
                    <li>Shree Siddhivinayak Strikers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reset Button - Fixed at bottom right */}
        {/* Reset Button - Fixed at bottom right */}
        {isEditable && (
          <Button
            onClick={handleReset}
            disabled={isResetting}
            className="fixed bottom-24 right-8 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isResetting ? 'Resetting...' : 'Reset Database'}
          </Button>
        )}
      </div>
    </div>
  );
}
