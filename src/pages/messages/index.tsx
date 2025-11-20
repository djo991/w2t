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
import { Send, User as UserIcon, Store } from "lucide-react";
import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import type { Conversation, Message } from "@/types";

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (router.isReady && router.query.chat) {
      const chatId = router.query.chat as string;
      setSelectedConversationId(chatId);
    }
  }, [router.isReady, router.query.chat]);

  // 1. Fetch Conversations on Load
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      // Query with explicit joins
      let query = supabase.from("conversations").select(`
        *,
        studios (name, cover_image),
        profiles!conversations_customer_id_fkey (full_name, id) 
      `);
      // Note: We fetch 'profiles' to get the customer name. 
      // We added the Foreign Key in SQL so this join now works.

      if (profile?.role === "customer") {
        query = query.eq("customer_id", user.id);
      } 
      
      const { data, error } = await query.order("updated_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching conversations:", error);
      }

      if (data) {
        setConversations(data as unknown as Conversation[]);
      }
    };

    fetchConversations();
  }, [user, profile]);

  // 2. Fetch Messages when a conversation is selected
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

    // 3. REALTIME SUBSCRIPTION
    const channel = supabase
      .channel(`chat:${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic clear

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversationId,
      sender_id: user.id,
      content: content,
    });

    if (error) {
      console.error("Failed to send", error);
    } else {
        // Update conversation timestamp
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq('id', selectedConversationId);
    }
  };

  // Helper to get the "Other Person's" name/avatar
  const getPartnerInfo = (conv: Conversation) => {
    if (profile?.role === "customer") {
        // I am a customer, show me the Studio
        return {
            name: conv.studios?.name || "Studio",
            avatar: conv.studios?.cover_image || "",
            icon: <Store className="w-4 h-4" />
        };
    } else {
        // I am a studio, show me the Customer
        // The profile data comes from the join we just fixed
        const customerProfile = (conv as any).profiles; 
        return {
            name: customerProfile?.full_name || "Customer",
            avatar: "", // We haven't implemented customer avatars in the profile yet, but this prevents crash
            icon: <UserIcon className="w-4 h-4" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-5rem)]">
        
        {/* Sidebar: Conversation List */}
        <Card className={`md:w-1/3 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b font-semibold text-lg">Messages</div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {conversations.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet.</div>
                    )}
                    {conversations.map(conv => {
                        const partner = getPartnerInfo(conv);
                        return (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConversationId(conv.id)}
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
                </div>
            </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className={`flex-1 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversationId ? (
                <>
                    <div className="p-4 border-b flex items-center justify-between shadow-sm">
                         <div className="font-semibold flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversationId(null)}>
                                 ←
                             </Button>
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
                                        <div 
                                            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                                                isMe 
                                                ? 'bg-[hsl(var(--ink-red))] text-white rounded-br-none' 
                                                : 'bg-secondary text-secondary-foreground rounded-bl-none'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t mt-auto">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a conversation to start chatting
                </div>
            )}
        </Card>

      </div>
    </div>
  );
}