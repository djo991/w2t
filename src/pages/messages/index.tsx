// src/pages/messages/index.tsx

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, User as UserIcon, Store, Paperclip, X, Mail, MessageSquare } from "lucide-react";
import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import { ImageUpload } from "@/components/ImageUpload";
import type { Conversation, Message, ContactRequest } from "@/types";

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"chats" | "inquiries">("chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inquiries, setInquiries] = useState<ContactRequest[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // 1. Auto-select from URL
  useEffect(() => {
    if (!router.isReady) return;
    
    if (router.query.chat) {
      setActiveTab("chats");
      setSelectedConversationId(router.query.chat as string);
    } else if (router.query.inquiry) {
      setActiveTab("inquiries");
      setSelectedInquiryId(router.query.inquiry as string);
    } else if (router.query.tab === 'inquiries') {
      setActiveTab("inquiries");
    }
  }, [router.isReady, router.query]);

  // 2. Fetch Data
  useEffect(() => {
    if (!user || !profile) return;

    const fetchData = async () => {
      let query = supabase.from("conversations").select(`
        *,
        studios (name, cover_image),
        profiles!conversations_customer_id_fkey (full_name, id) 
      `);

      if (profile.role === "customer") {
        query = query.eq("customer_id", user.id);
      } 
      
      const { data: convData } = await query.order("updated_at", { ascending: false });
      if (convData) setConversations(convData as unknown as Conversation[]);

      if (profile.role === "studio_owner") {
        const { data: inqData } = await supabase
          .from("contact_requests")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (inqData) setInquiries(inqData as ContactRequest[]);
      }
    };

    fetchData();
  }, [user, profile]);

  // 3. Fetch Messages & Mark as Read
  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversationId)
        .order("created_at", { ascending: true });
        
      setMessages(data || []);
      scrollToBottom();
    };

    fetchMessages();

    // Mark unread messages as read
    const markAsRead = async () => {
      if (!user) return;
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", selectedConversationId)
        .neq("sender_id", user.id) // Don't mark my own messages
        .eq("is_read", false);
    };
    markAsRead();

    const channel = supabase
      .channel(`chat:${selectedConversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
          // If I receive a new message while chat is open, mark it read immediately
          if (payload.new.sender_id !== user?.id) {
             supabase.from("messages").update({ is_read: true }).eq('id', payload.new.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConversationId, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedConversationId || !user) return;

    const content = newMessage;
    const currentAttachment = attachment;
    
    setNewMessage("");
    setAttachment(null);

    await supabase.from("messages").insert({
      conversation_id: selectedConversationId,
      sender_id: user.id,
      content: content,
      attachments: currentAttachment ? [currentAttachment] : [],
    });
    
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq('id', selectedConversationId);
  };

  const getPartnerInfo = (conv: Conversation) => {
    if (profile?.role === "customer") {
        return {
            name: conv.studios?.name || "Studio",
            avatar: conv.studios?.cover_image || "",
            icon: <Store className="w-4 h-4" />
        };
    } else {
        const customerProfile = (conv as any).profiles; 
        return {
            name: customerProfile?.full_name || "Customer",
            avatar: "", 
            icon: <UserIcon className="w-4 h-4" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-5rem)]">
        
        {/* LEFT SIDEBAR */}
        <Card className={`md:w-1/3 flex flex-col ${selectedConversationId || selectedInquiryId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b">
                {profile?.role === "studio_owner" ? (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="chats">
                                <MessageSquare className="w-4 h-4 mr-2" /> Chats
                            </TabsTrigger>
                            <TabsTrigger value="inquiries">
                                <Mail className="w-4 h-4 mr-2" /> Inquiries
                                {inquiries.some(i => !i.is_read) && (
                                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                ) : (
                    <div className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> My Messages
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {/* CHATS LIST */}
                    {activeTab === "chats" && (
                        <>
                            {conversations.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet.</div>}
                            {conversations.map(conv => {
                                const partner = getPartnerInfo(conv);
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => {
                                            setSelectedConversationId(conv.id);
                                            setSelectedInquiryId(null);
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${selectedConversationId === conv.id ? 'bg-secondary' : 'hover:bg-muted'}`}
                                    >
                                        <Avatar>
                                            <AvatarImage src={partner.avatar} />
                                            <AvatarFallback>{partner.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{partner.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                {partner.icon}
                                                <span>{formatDistanceToNow(new Date(conv.updated_at))} ago</span>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </>
                    )}

                    {/* INQUIRIES LIST (UPDATED) */}
                    {activeTab === "inquiries" && (
                        <>
                            {inquiries.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No inquiries yet.</div>}
                            {inquiries.map(inq => (
                                <button
                                    key={inq.id}
                                    onClick={async () => {
                                        setSelectedInquiryId(inq.id);
                                        setSelectedConversationId(null);
                                        
                                        // Optimistic update
                                        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, is_read: true } : i));

                                        // Mark as read in DB
                                        if (!inq.is_read) {
                                            await supabase.from("contact_requests").update({ is_read: true }).eq("id", inq.id);
                                        }
                                    }}
                                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${selectedInquiryId === inq.id ? 'bg-secondary' : 'hover:bg-muted'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate flex justify-between">
                                            {inq.name}
                                            {!inq.is_read && <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">{inq.email}</div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate opacity-70">{inq.message}</div>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </ScrollArea>
        </Card>

        {/* RIGHT MAIN CONTENT */}
        <Card className={`flex-1 flex flex-col ${(!selectedConversationId && !selectedInquiryId) ? 'hidden md:flex' : 'flex'}`}>
            
            {/* SCENARIO 1: ACTIVE CHAT */}
            {selectedConversationId && (
                <>
                    <div className="p-4 border-b flex items-center justify-between shadow-sm">
                         <div className="font-semibold flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversationId(null)}>←</Button>
                             {conversations.find(c => c.id === selectedConversationId) 
                                ? getPartnerInfo(conversations.find(c => c.id === selectedConversationId)!).name 
                                : "Chat"}
                         </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 bg-muted/10">
                        <div className="flex flex-col gap-4">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${isMe ? 'bg-[hsl(var(--ink-red))] text-white rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mb-2">
                                                    {msg.attachments.map((img: string, idx: number) => (
                                                        <a href={img} target="_blank" rel="noreferrer" key={idx}>
                                                            <img src={img} alt="attachment" className="max-w-full rounded-md border" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t mt-auto">
                        {attachment && (
                            <div className="mb-2 relative inline-block">
                                <img src={attachment} className="h-16 w-16 object-cover rounded border" alt="attachment" />
                                <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="ghost" size="icon"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-4" align="start">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Attach Image</h4>
                                        <ImageUpload bucket="chat-attachments" onUpload={(url) => { setAttachment(url); setIsPopoverOpen(false); }} label="Upload" />
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
                            <Button type="submit" size="icon" disabled={!newMessage.trim() && !attachment}><Send className="w-4 h-4" /></Button>
                        </form>
                    </div>
                </>
            )}

            {/* SCENARIO 2: ACTIVE INQUIRY */}
            {selectedInquiryId && (
                <div className="flex-1 flex flex-col">
                    {(() => {
                        const inquiry = inquiries.find(i => i.id === selectedInquiryId);
                        if (!inquiry) return null;
                        return (
                            <>
                                <div className="p-4 border-b flex items-center gap-2 shadow-sm">
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedInquiryId(null)}>←</Button>
                                    <div className="font-semibold">Inquiry Details</div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">{inquiry.name}</h2>
                                        <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline flex items-center gap-2 mt-1">
                                            <Mail className="w-4 h-4" /> {inquiry.email}
                                        </a>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            Received {formatDistanceToNow(new Date(inquiry.created_at))} ago
                                        </div>
                                    </div>
                                    
                                    <div className="bg-secondary/20 p-6 rounded-lg border">
                                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Message</h3>
                                        <p className="whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={() => window.location.href = `mailto:${inquiry.email}`}>
                                            Reply via Email
                                        </Button>
                                        <Button variant="outline" onClick={() => {
                                             setSelectedInquiryId(null);
                                        }}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    })()}
                </div>
            )}

            {/* SCENARIO 3: NOTHING SELECTED */}
            {!selectedConversationId && !selectedInquiryId && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a conversation or inquiry to view details
                </div>
            )}
        </Card>

      </div>
    </div>
  );
}