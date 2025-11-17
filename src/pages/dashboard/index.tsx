
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Star, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Appointment } from "@/types";

export default function DashboardPage() {
  const appointments: Appointment[] = [
    {
      id: "1",
      studioId: "1",
      artistId: "1",
      userId: "u1",
      date: "2025-11-18",
      time: "2:00 PM",
      duration: 3,
      status: "confirmed",
      notes: "Full sleeve session - Japanese dragon"
    },
    {
      id: "2",
      studioId: "1",
      artistId: "2",
      userId: "u2",
      date: "2025-11-18",
      time: "4:00 PM",
      duration: 2,
      status: "pending",
      notes: "Portrait tattoo consultation"
    },
    {
      id: "3",
      studioId: "1",
      artistId: "3",
      userId: "u3",
      date: "2025-11-19",
      time: "11:00 AM",
      duration: 4,
      status: "confirmed",
      notes: "Traditional eagle chest piece"
    },
    {
      id: "4",
      studioId: "1",
      artistId: "1",
      userId: "u4",
      date: "2025-11-19",
      time: "3:00 PM",
      duration: 2,
      status: "pending",
      notes: "Small geometric design"
    }
  ];

  const stats = [
    { label: "Total Bookings", value: "342", icon: Calendar, change: "+12%", trend: "up" },
    { label: "Active Clients", value: "156", icon: Users, change: "+8%", trend: "up" },
    { label: "Avg Rating", value: "4.9", icon: Star, change: "+0.2", trend: "up" },
    { label: "Revenue", value: "$28.5K", icon: TrendingUp, change: "+15%", trend: "up" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--ink-red))] to-[hsl(var(--ink-blue))] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W2</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Where<span className="text-[hsl(var(--ink-red))]">2</span>Tattoo</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-[hsl(var(--ink-red))]">Dashboard</Link>
            <a href="#bookings" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">Bookings</a>
            <a href="#artists" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">Artists</a>
            <a href="#portfolio" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">Portfolio</a>
          </nav>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" />
              <AvatarFallback>IM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Studio Dashboard</h1>
          <p className="text-muted-foreground">Manage your studio, bookings, and artists</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-[hsl(var(--ink-red))]" />
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Appointment #{appointment.id}</h4>
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{appointment.notes}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.time} ({appointment.duration}hrs)</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="confirmed" className="space-y-4">
                    {appointments.filter(a => a.status === "confirmed").map((appointment) => (
                      <div key={appointment.id} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Appointment #{appointment.id}</h4>
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{appointment.notes}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.time} ({appointment.duration}hrs)</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {appointments.filter(a => a.status === "pending").map((appointment) => (
                      <div key={appointment.id} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Appointment #{appointment.id}</h4>
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{appointment.notes}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.time} ({appointment.duration}hrs)</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add Artist
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Update Portfolio
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>AR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Alex Rivera</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Amazing work on my sleeve!</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>ED</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Emma Davis</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Professional and talented artists</p>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  View All Reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
