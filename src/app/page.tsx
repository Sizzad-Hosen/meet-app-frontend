import {
  CalendarClock,
  CircleDot,
  DoorOpen,
  Mic,
  MonitorUp,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const metrics = [
  { label: "Live rooms", value: "12", tone: "bg-emerald-500" },
  { label: "Waiting", value: "08", tone: "bg-amber-500" },
  { label: "Recording", value: "04", tone: "bg-rose-500" },
];

const controls = [
  { icon: Mic, label: "Mute all" },
  { icon: MonitorUp, label: "Screen share" },
  { icon: DoorOpen, label: "Breakouts" },
];

const sessions = [
  {
    title: "Product weekly sync",
    time: "10:00 AM",
    code: "MEET-2841",
    state: "Live",
  },
  {
    title: "Design review",
    time: "01:30 PM",
    code: "MEET-9137",
    state: "Scheduled",
  },
  {
    title: "Engineering retro",
    time: "04:00 PM",
    code: "MEET-4729",
    state: "Waiting room",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#f0fdfa_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
              <Video className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Meet Apps</p>
              <h1 className="text-xl font-semibold text-slate-950">
                Meeting command center
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">API ready</Badge>
            <Button size="sm">
              <CalendarClock className="size-4" />
              Schedule
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map((item) => (
                <Card key={item.label}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-1 text-3xl font-semibold text-slate-950">
                        {item.value}
                      </p>
                    </div>
                    <span className={`size-3 rounded-full ${item.tone}`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Start or join</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Create an instant meeting or enter a join code.
                    </p>
                  </div>
                  <Badge>Host tools</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Meeting title" />
                    <Input placeholder="Max participants" type="number" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button className="h-11">
                      <Video className="size-4" />
                      Create meeting
                    </Button>
                    <Button className="h-11" variant="secondary">
                      <Users className="size-4" />
                      Admit waiting
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="join-code"
                  >
                    Join code
                  </label>
                  <div className="mt-2 flex gap-2">
                    <Input id="join-code" placeholder="ABCD1234" />
                    <Button aria-label="Join meeting" size="icon">
                      <DoorOpen className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {controls.map((item) => (
                      <Button key={item.label} size="icon" variant="outline">
                        <item.icon className="size-4" />
                        <span className="sr-only">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {sessions.map((session) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    key={session.code}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-md bg-cyan-50 text-cyan-700">
                        <CircleDot className="size-4" />
                      </span>
                      <div>
                        <p className="font-medium text-slate-950">
                          {session.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {session.time} · {session.code}
                        </p>
                      </div>
                    </div>
                    <Badge variant={session.state === "Live" ? "success" : "default"}>
                      {session.state}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <aside className="grid content-start gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Room policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                {[
                  "Waiting room enabled",
                  "Host approval for screen share",
                  "Recordings stored securely",
                ].map((item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <span className="grid size-8 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="size-4" />
                    </span>
                    <p className="text-sm font-medium text-slate-700">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {process.env.NEXT_PUBLIC_API_BASE_URL ??
                    "http://localhost:8000/api/v1"}
                </div>
                <p>
                  Redux Toolkit and RTK Query are configured for auth,
                  meetings, participants, and LiveKit token requests.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
