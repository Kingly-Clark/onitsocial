"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { User, Lock, Bell, Trash2, AlertTriangle, Save, Eye, EyeOff } from "lucide-react";
import type { User as UserType } from "@/types/database";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

export default function SettingsPage() {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile tab state
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [email, setEmail] = useState("");

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setTimezone(user.timezone || "UTC");
      setEmail(user.email || "");
    }
  }, [user]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Profile tab handlers
  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      showMessage("error", "Full name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          timezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage("error", data.error || "Failed to update profile");
        return;
      }

      showMessage("success", "Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      showMessage("error", "An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Security tab handlers
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage("error", "All password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      showMessage("error", "New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "New password and confirm password do not match");
      return;
    }

    if (currentPassword === newPassword) {
      showMessage("error", "New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage("error", data.error || "Failed to change password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);
      showMessage("error", "An error occurred while changing your password");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showMessage("error", 'Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage("error", data.error || "Failed to delete account");
        return;
      }

      // Redirect to auth page after successful deletion
      window.location.href = "/";
    } catch (error) {
      console.error("Delete account error:", error);
      showMessage("error", "An error occurred while deleting your account");
      setIsLoading(false);
    }
  };

  const getAvatarInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div>
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Danger</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />}
                  <AvatarFallback>{getAvatarInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avatar from your email account</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Your email cannot be changed</p>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium">
                  Timezone
                </label>
                <Select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={isLoading}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Change Password</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your password to keep your account secure</p>
                </div>

                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Change Password Button */}
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Notification preferences coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible and dangerous actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-200">Delete Account</h3>
                    <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Delete Account Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600 dark:text-red-400">Delete Account</DialogTitle>
                      <DialogDescription>
                        This action is permanent and cannot be undone. All your data will be deleted.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          Deleting your account will:
                        </p>
                        <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside mt-2 space-y-1">
                          <li>Delete all your brands</li>
                          <li>Disconnect all social accounts</li>
                          <li>Delete all posts and schedules</li>
                          <li>Remove all analytics data</li>
                          <li>Delete all messages</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmDelete" className="text-sm font-medium">
                          Type "DELETE" to confirm:
                        </label>
                        <Input
                          id="confirmDelete"
                          placeholder='Type "DELETE"'
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeleteDialogOpen(false);
                          setDeleteConfirmText("");
                        }}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading || deleteConfirmText !== "DELETE"}
                      >
                        {isLoading ? "Deleting..." : "Delete Account"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
