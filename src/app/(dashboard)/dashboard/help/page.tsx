"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Shield,
  Lightbulb,
  MessageSquare,
  Sparkles,
  CreditCard,
  Heart,
  Eye,
  AlertTriangle,
  UserCheck,
  Search,
  Send,
  BookOpen,
  Star,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Find answers to common questions, learn how to use NikahFirst effectively,
          and get support when you need it
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for help topics..."
            className="pl-10 py-6 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2">
          <TabsTrigger value="faqs" className="flex items-center gap-2 py-3">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2 py-3">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Safety Tips</span>
          </TabsTrigger>
          <TabsTrigger value="getting-started" className="flex items-center gap-2 py-3">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Getting Started</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2 py-3">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2 py-3">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Pro Tips</span>
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-6">
          {/* How Credits Work */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                How Credits Work
              </CardTitle>
              <CardDescription>
                Understanding the NikahFirst credit system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="credits-1">
                  <AccordionTrigger>What are credits and how do I use them?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      Credits are the currency used on NikahFirst to perform certain actions.
                      You need credits to send interests, view contact details of matches,
                      and access premium features. Credits can be earned through daily redemption
                      or purchased directly.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="credits-2">
                  <AccordionTrigger>What's the difference between Redeem and Funding credits?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      <strong>Redeem Credits:</strong> Free credits you earn daily based on your
                      subscription tier and platform activity. These have a daily limit and reset
                      each day.<br /><br />
                      <strong>Funding Credits:</strong> Credits you purchase with real money.
                      These don't expire and are used first when performing actions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="credits-3">
                  <AccordionTrigger>How many credits does each action cost?</AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-gray-600 space-y-2">
                      <li>• <strong>Send Interest:</strong> 1 credit</li>
                      <li>• <strong>View Contact Details:</strong> 2 credits</li>
                      <li>• <strong>Highlight Profile:</strong> 5 credits</li>
                      <li>• <strong>Send Priority Message:</strong> 3 credits</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-3">
                      Credit costs may vary based on your subscription tier.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="credits-4">
                  <AccordionTrigger>How can I earn free credits?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      You can earn free credits by:
                    </p>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li>• Daily login bonus</li>
                      <li>• Completing your profile (100% completion bonus)</li>
                      <li>• Verifying your profile</li>
                      <li>• Referring friends to the platform</li>
                      <li>• Participating in special promotions</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* How to Send Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                How to Send Interest
              </CardTitle>
              <CardDescription>
                Connecting with potential matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="interest-1">
                  <AccordionTrigger>How do I send an interest to someone?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      To send an interest:
                    </p>
                    <ol className="text-gray-600 mt-2 space-y-2 list-decimal list-inside">
                      <li>Browse profiles or use the search feature to find matches</li>
                      <li>Click on a profile to view their details</li>
                      <li>Click the "Send Interest" button on their profile</li>
                      <li>Optionally add a personalized message</li>
                      <li>Confirm to send (1 credit will be deducted)</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="interest-2">
                  <AccordionTrigger>What happens after I send an interest?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      The recipient will receive a notification about your interest. They can:
                    </p>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li>• <strong>Accept:</strong> You both become matches and can view each other's contact details</li>
                      <li>• <strong>Decline:</strong> The interest is rejected (you won't be notified)</li>
                      <li>• <strong>Ignore:</strong> The interest expires after 30 days</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="interest-3">
                  <AccordionTrigger>Can I withdraw a sent interest?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      Yes, you can withdraw a pending interest within 24 hours of sending it.
                      Your credit will be refunded. After 24 hours, the interest cannot be
                      withdrawn but will automatically expire if not responded to within 30 days.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Profile Visibility Rules
              </CardTitle>
              <CardDescription>
                Understanding who can see your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="visibility-1">
                  <AccordionTrigger>Who can view my profile?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      By default, your profile is visible to all registered members who match
                      your preferences (opposite gender, within age range, etc.). You can
                      customize visibility in Settings & Privacy to:
                    </p>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li>• Hide from search results</li>
                      <li>• Show only to premium members</li>
                      <li>• Make profile completely private</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="visibility-2">
                  <AccordionTrigger>Can I see who viewed my profile?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      Yes! The "Profile Visitors" section in your dashboard shows who has
                      viewed your profile. Free members can see limited visitor information,
                      while premium members get detailed insights including when they visited.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="visibility-3">
                  <AccordionTrigger>How do I hide my profile temporarily?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      Go to Settings & Privacy → Privacy → Toggle off "Show Profile in Search".
                      Your profile will be hidden from search results but existing connections
                      can still see you. To completely hide, deactivate your account temporarily.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Tips Tab */}
        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Safe Meeting Guidelines
              </CardTitle>
              <CardDescription>
                Important tips for meeting potential matches safely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Before Meeting</h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• Video call first to verify identity</li>
                    <li>• Verify their profile through our verification system</li>
                    <li>• Share your plans with a family member</li>
                    <li>• Research the person online</li>
                    <li>• Trust your instincts - if something feels off, don't proceed</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">During the Meeting</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>• Meet in a public place (restaurant, cafe, park)</li>
                    <li>• Bring a family member or friend (recommended)</li>
                    <li>• Keep your phone charged and accessible</li>
                    <li>• Don't share personal financial information</li>
                    <li>• Arrange your own transportation</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Reminders</h4>
                <p className="text-sm text-yellow-700">
                  Always involve your family in the process. In our culture, marriage is
                  a family matter. Having your family's involvement adds an extra layer
                  of security and ensures everyone is aligned.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Avoiding Scams
              </CardTitle>
              <CardDescription>
                Protect yourself from fraudulent users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Red Flags to Watch For</h4>
                <ul className="text-sm text-red-700 space-y-2">
                  <li>• Asking for money or financial help (any reason)</li>
                  <li>• Refusing video calls or in-person meetings</li>
                  <li>• Inconsistent stories or profile information</li>
                  <li>• Rushing the relationship or proposal</li>
                  <li>• Asking for personal documents or bank details</li>
                  <li>• Claiming to be abroad with urgent need for funds</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">What to Do If You Suspect a Scam</h4>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Stop all communication immediately</li>
                  <li>Do not send any money or personal information</li>
                  <li>Report the profile using the "Report" button</li>
                  <li>Block the user to prevent further contact</li>
                  <li>Contact our support team if you've shared sensitive information</li>
                </ol>
              </div>
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Suspicious Activity
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Creating a Strong Profile
              </CardTitle>
              <CardDescription>
                Tips for completing a profile that attracts genuine matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Profile Photos</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Use a clear, recent photo of yourself</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Good lighting and simple background</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Dress modestly and appropriately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Smile - it makes a big difference!</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Bio & Description</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Be honest about yourself and expectations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Mention your values and what matters to you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Keep it positive and avoid negative statements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Include hobbies and interests</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Profile Completion Checklist</h4>
                <div className="grid gap-2 md:grid-cols-2 text-sm text-green-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" disabled /> Basic information
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" disabled /> Education details
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" disabled /> Profession/Career
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" disabled /> Family background
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" disabled /> At least 2 photos
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" disabled /> Partner preferences
                  </label>
                </div>
                <p className="text-xs text-green-600 mt-3">
                  Complete profiles get 3x more responses!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get started with NikahFirst in 5 simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Complete Your Profile", desc: "Fill in all details and upload photos" },
                  { step: 2, title: "Verify Your Account", desc: "Complete phone/email verification for trust badge" },
                  { step: 3, title: "Set Partner Preferences", desc: "Define what you're looking for in a match" },
                  { step: 4, title: "Browse & Connect", desc: "Search profiles and send interests to matches" },
                  { step: 5, title: "Involve Your Family", desc: "Share promising matches with your family" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Support Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Report an Issue
                </CardTitle>
                <CardDescription>
                  Report bugs, inappropriate content, or policy violations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <select
                    id="issue-type"
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Select an issue type</option>
                    <option value="bug">Technical Bug/Error</option>
                    <option value="abuse">Abusive/Inappropriate Behavior</option>
                    <option value="scam">Suspected Scam/Fraud</option>
                    <option value="fake">Fake Profile</option>
                    <option value="harassment">Harassment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue-desc">Description</Label>
                  <Textarea
                    id="issue-desc"
                    placeholder="Please describe the issue in detail..."
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Request Assistance
                </CardTitle>
                <CardDescription>
                  Get help with your account or general inquiries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="help-topic">Topic</Label>
                  <select
                    id="help-topic"
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Select a topic</option>
                    <option value="account">Account Issues</option>
                    <option value="subscription">Subscription/Billing</option>
                    <option value="credits">Credits & Payments</option>
                    <option value="profile">Profile Help</option>
                    <option value="matching">Matching & Connections</option>
                    <option value="privacy">Privacy Concerns</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="help-message">Your Message</Label>
                  <Textarea
                    id="help-message"
                    placeholder="How can we help you?"
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-semibold">Email Support</h4>
                  <p className="text-sm text-gray-600">support@nikahfirst.com</p>
                  <p className="text-xs text-gray-500 mt-1">Response within 24-48 hours</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-semibold">WhatsApp</h4>
                  <p className="text-sm text-gray-600">+92 300 1234567</p>
                  <p className="text-xs text-gray-500 mt-1">Mon-Sat, 9 AM - 6 PM PKT</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <HelpCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-semibold">Live Chat</h4>
                  <p className="text-sm text-gray-600">Coming Soon</p>
                  <p className="text-xs text-gray-500 mt-1">Chat with our support team</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pro Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Make the Most of NikahFirst
              </CardTitle>
              <CardDescription>
                Practical tips and insights on using the platform effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-green-50 to-cyan-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">
                  Tips for Finding the Right Match
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Be Patient:</strong> Finding the right life partner takes time.
                      Don't rush the process - quality matters more than quantity.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Be Realistic:</strong> Set reasonable expectations.
                      Focus on compatibility in values and goals rather than just appearance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Stay Active:</strong> Regular activity on the platform
                      increases your visibility and chances of finding matches.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Respond Promptly:</strong> Quick responses show genuine
                      interest and keep conversations flowing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">
                  Communication Best Practices
                </h4>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li>• Start with Salam and maintain respectful communication</li>
                  <li>• Ask meaningful questions about values, goals, and family</li>
                  <li>• Be honest about your expectations from the start</li>
                  <li>• Involve your family early in promising conversations</li>
                  <li>• Don't share personal contact details until you're comfortable</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">
                  Personal Recommendations Coming Soon
                </h4>
                <p className="text-sm text-blue-700">
                  We're working on personalized tips and recommendations based on
                  successful matches on our platform. Check back soon for insights
                  from real couples who found their match on NikahFirst!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Did You Know?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-gray-600 mt-1">
                    of users with complete profiles get more responses
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">3x</div>
                  <p className="text-sm text-gray-600 mt-1">
                    more matches with verified profiles
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">72%</div>
                  <p className="text-sm text-gray-600 mt-1">
                    of successful matches involve family early
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
