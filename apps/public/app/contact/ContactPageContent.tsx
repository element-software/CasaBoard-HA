"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";

export default function ContactPageContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !email || !message) {
      setErrorMessage("Please fill in your name, email, and message.");
      return;
    }
    const emailPattern = /^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to send message. Please try again later.");
      }
      setSuccessMessage("Thanks! Your message has been sent.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-16 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-sm text-slate-600">
          Prefer GitHub?{" "}
          <a
            href="https://github.com/element-software/CasaBoard-HA/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-700 hover:underline"
          >
            Open an issue
          </a>{" "}
          on the public MIT-licensed repo — best for bugs and feature requests.
        </div>
        {/* Form card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-base font-semibold text-slate-900">Send a message</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{ inputWrapper: "border-slate-200" }}
              />
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{ inputWrapper: "border-slate-200" }}
              />
              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                variant="bordered"
                classNames={{ inputWrapper: "border-slate-200" }}
              />
              <Textarea
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minRows={6}
                isRequired
                variant="bordered"
                classNames={{ inputWrapper: "border-slate-200" }}
              />

              {successMessage && (
                <div className="px-4 py-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg" role="status" aria-live="polite">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg" role="alert" aria-live="assertive">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button color="primary" type="submit" isLoading={isSubmitting}>
                  Send message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
