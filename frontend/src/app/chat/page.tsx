"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronUp, MessageSquareText, Search, Send, User } from "lucide-react";
import { CheckCheck } from "lucide-react";
import Cookies from "js-cookie";
import api from "@/services/api";
import { MessageRequest, MessageResponse, UserResponse, WSMessage } from "@/types/type";

const LIMIT = 30;

export default function ChatPage() {
	const router = useRouter();
	const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
	const [chatList, setChatList] = useState<MessageResponse[]>([]);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [messages, setMessages] = useState<MessageResponse[]>([]);
	const [messageInput, setMessageInput] = useState("");
	const [isLoadingList, setIsLoadingList] = useState(true);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState("");
	const [hasMore, setHasMore] = useState(false);
	const [offset, setOffset] = useState(0);

	const wsRef = useRef<WebSocket | null>(null);
	const chatListRef = useRef<MessageResponse[]>([]);
	const activeChatIdRef = useRef<string | null>(null);
	const currentUserRef = useRef<UserResponse | null>(null);
	const chatContainerRef = useRef<HTMLDivElement | null>(null);

	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSidebar, setShowSidebar] = useState(true);

	const searchParams = useSearchParams();
	const newChatUserId = searchParams.get("userId");
	const newChatUserName = searchParams.get("name") || "User";

	const currentUserId = currentUser?.id ?? "";

	useEffect(() => { chatListRef.current = chatList; }, [chatList]);
	useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
	useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

	const normalizeMessage = (raw: any): MessageResponse => {
		const senderName = raw?.sender?.name ?? raw?.sender_name ?? "Unknown";
		const receiverName = raw?.receiver?.name ?? raw?.receiver_name ?? "Unknown";
		return {
			id: raw.id,
			sender_id: raw.sender_id,
			receiver_id: raw.receiver_id,
			content: raw.content,
			is_read: raw.is_read,
			created_at: raw.created_at,
			sender: raw.sender ?? { id: raw.sender_id, name: senderName, email: "", role: "" },
			receiver: raw.receiver ?? { id: raw.receiver_id, name: receiverName, email: "", role: "" },
		};
	};

	const getOtherUserId = (message: MessageResponse, userId: string) =>
		message.sender_id === userId ? message.receiver_id : message.sender_id;

	const getOtherUserName = (message: MessageResponse, userId: string) =>
		message.sender_id === userId ? message.receiver.name : message.sender.name;

	const buildWsUrl = (token: string) => {
		const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
		const normalized = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
		let wsBase = normalized;
		if (normalized.startsWith("https://")) {
			wsBase = normalized.replace("https://", "wss://");
		} else if (normalized.startsWith("http://")) {
			wsBase = normalized.replace("http://", "ws://");
		} else {
			wsBase = `ws://${normalized}`;
		}
		return `${wsBase}/ws/chat?token=${encodeURIComponent(token)}`;
	};

	const resolveUserName = (userId: string, list: MessageResponse[]) => {
		const current = currentUserRef.current;
		if (current && userId === current.id) return current.name || "You";
		for (const item of list) {
			if (item.sender_id === userId) return item.sender?.name || "Unknown";
			if (item.receiver_id === userId) return item.receiver?.name || "Unknown";
		}
		return "Unknown";
	};

	const activeChatName = useMemo(() => {
		if (!activeChatId) return "";
		const fromList = chatList.find((item) => getOtherUserId(item, currentUserId) === activeChatId);
		if (!fromList) return "Chat";
		return getOtherUserName(fromList, currentUserId);
	}, [activeChatId, chatList, currentUserId]);

	const filteredChatList = useMemo(() => {
		if (!searchQuery.trim()) return chatList;
		const q = searchQuery.toLowerCase();
		return chatList.filter((item) => {
			const name = getOtherUserName(item, currentUserId).toLowerCase();
			return name.includes(q) || item.content.toLowerCase().includes(q);
		});
	}, [chatList, searchQuery, currentUserId]);

	// auto-scroll ke bawah (pesan terbaru)
	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = 0;
		}
	};

	// scroll saat ada pesan baru 
	useEffect(() => {
		const el = chatContainerRef.current;
		if (!el) return;
		if (el.scrollTop <= 150) {
			el.scrollTop = 0;
		}
	}, [messages.length]);

	// selalu scroll ke bawah saat ganti percakapan
	useEffect(() => {
		scrollToBottom();
	}, [activeChatId]);

	useEffect(() => {
		const token = Cookies.get("token");
		if (!token) {
			router.push("/login?redirect=/chat");
			return;
		}

		const load = async () => {
			setError("");
			setIsLoadingList(true);
			try {
				const [profileRes, listRes] = await Promise.all([
					api.get("/user/profile"),
					api.get("/chat"),
				]);

				const profile: UserResponse = profileRes.data;
				setCurrentUser(profile);
				const normalized = (listRes.data || []).map(normalizeMessage);

				// mencegah chat dengan diri sendiri
				if (newChatUserId && newChatUserId === profile.id) {
					setChatList(normalized);
					if (normalized.length > 0) {
						setActiveChatId(getOtherUserId(normalized[0], profile.id));
					}
					return;
				}

				if (newChatUserId) {
					const existingChat = normalized.find(
						(item: MessageResponse) => getOtherUserId(item, profile.id) === newChatUserId
					);

					if (existingChat) {
						setChatList(normalized);
						setActiveChatId(newChatUserId);
					} else {
						const draftChat: MessageResponse = {
							id: `draft-${newChatUserId}`,
							sender_id: profile.id,
							receiver_id: newChatUserId,
							content: "Start a conversation...",
							is_read: true,
							created_at: new Date().toString(),
							sender: { id: profile.id, name: profile.name, email: "", role: "" },
							receiver: { id: newChatUserId, name: newChatUserName, email: "", role: "" },
						};
						setChatList([draftChat, ...normalized]);
						setActiveChatId(newChatUserId);
					}
				} else {
					setChatList(normalized);
					if (normalized.length > 0) {
						setActiveChatId(getOtherUserId(normalized[0], profile.id));
					}
				}
			} catch {
				setError("Failed to load chats. Please try again.");
			} finally {
				setIsLoadingList(false);
			}
		};

		load();
	}, [router]);

	// WebSocket
	useEffect(() => {
		const token = Cookies.get("token");
		const current = currentUserRef.current;
		if (!token || !current?.id) return;

		const wsUrl = buildWsUrl(token);
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onmessage = async (event) => {
			let payload: WSMessage | null = null;
			try { payload = JSON.parse(event.data); } catch { return; }
			if (!payload) return;

			if (payload.type === "CHAT") {
				const p = payload as { type: "CHAT"; sender_id: string; receiver_id: string; content: string };
				const listSnapshot = chatListRef.current;
				const currentSnapshot = currentUserRef.current;
				if (!currentSnapshot) return;

				if (p.sender_id === currentSnapshot.id) return;

				const otherId = p.sender_id;
				const senderName = resolveUserName(p.sender_id, listSnapshot);
				const receiverName = resolveUserName(p.receiver_id, listSnapshot);
				const isActive = activeChatIdRef.current === otherId;
				const shouldMarkRead = isActive && p.receiver_id === currentSnapshot.id;

				const incoming: MessageResponse = {
					id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					sender_id: p.sender_id,
					receiver_id: p.receiver_id,
					content: p.content,
					is_read: shouldMarkRead,
					created_at: new Date().toString(),
					sender: { id: p.sender_id, name: senderName, email: "", role: "" },
					receiver: { id: p.receiver_id, name: receiverName, email: "", role: "" },
				};

				setChatList((prev) => {
					const filtered = prev.filter((item) => getOtherUserId(item, currentSnapshot.id) !== otherId);
					return [incoming, ...filtered];
				});

				if (isActive) {
					// prepend ke depan karena backend DESC
					setMessages((prev) => [incoming, ...prev]);
					if (p.receiver_id === currentSnapshot.id) {
						try { 
							await api.patch(`/chat/read/${p.sender_id}`); 
						} catch { 
							/* ignore */ 
						}
					}
				}

				const exists = listSnapshot.some((item) => getOtherUserId(item, currentSnapshot.id) === otherId);
				if (!exists) {
					try {
						const listRes = await api.get("/chat");
						setChatList((listRes.data || []).map(normalizeMessage));
					} catch { 
						/* ignore */ 
					}
				}
			}

			if (payload.type === "READ_RECEIPT") {
				const p = payload as { type: "READ_RECEIPT"; sender_id: string; receiver_id: string };
				const currentSnapshot = currentUserRef.current;
				if (!currentSnapshot || p.receiver_id !== currentSnapshot.id) return;

				setMessages((prev) =>
					prev.map((msg) =>
						msg.sender_id === currentSnapshot.id && msg.receiver_id === p.sender_id
							? { ...msg, is_read: true }
							: msg
					)
				);

				setChatList((prev) =>
					prev.map((item) => {
						const otherId = getOtherUserId(item, currentSnapshot.id);
						if (otherId !== p.sender_id) return item;
						if (item.sender_id !== currentSnapshot.id) return item;
						return { ...item, is_read: true };
					})
				);
			}

			if (payload.type === "USER_ONLINE") {
				const p = payload as { type: "USER_ONLINE"; sender_id: string };
				setOnlineUsers((prev) => Array.from(new Set([...prev, p.sender_id])));
			}

			if (payload.type === "USER_OFFLINE") {
				const p = payload as { type: "USER_OFFLINE"; sender_id: string };
				setOnlineUsers((prev) => prev.filter((id) => id !== p.sender_id));
			}
		};

		ws.onclose = () => { wsRef.current = null; };
		ws.onerror = () => { ws.close(); };

		return () => { ws.close(); };
	}, [currentUserId]);

	// load riwayat pesan dengan pagination 
	useEffect(() => {
		const loadHistory = async () => {
			if (!activeChatId) return;
			setIsLoadingHistory(true);
			setMessages([]);
			setOffset(0);
			setHasMore(false);
			setError("");
			try {
				const res = await api.get(`/chat/${activeChatId}?limit=${LIMIT}&offset=0`);
				const normalized = (res.data || []).map(normalizeMessage);
				setMessages(normalized);
				setHasMore(normalized.length >= LIMIT);
				await api.patch(`/chat/read/${activeChatId}`);
				if (currentUserId) {
					setChatList((prev) =>
						prev.map((item) => {
							const otherId = getOtherUserId(item, currentUserId);
							if (otherId !== activeChatId) return item;
							if (item.sender_id === currentUserId) return item;
							return { ...item, is_read: true };
						})
					);
				}
			} catch {
				setError("Failed to load chat history.");
			} finally {
				setIsLoadingHistory(false);
			}
		};

		loadHistory();
	}, [activeChatId, currentUserId]);

	// load older messages
	const handleLoadMore = async () => {
		if (!activeChatId || isLoadingMore || !hasMore) return;
		setIsLoadingMore(true);
		const newOffset = offset + LIMIT;
		try {
			const res = await api.get(`/chat/${activeChatId}?limit=${LIMIT}&offset=${newOffset}`);
			const normalized = (res.data || []).map(normalizeMessage);
			setMessages((prev) => [...prev, ...normalized]);
			setOffset(newOffset);
			setHasMore(normalized.length >= LIMIT);
		} catch { 
			/* ignore */ 
		} finally {
			setIsLoadingMore(false);
		}
	};

	const handleSelectChat = (message: MessageResponse) => {
		const otherId = getOtherUserId(message, currentUserId);
		setActiveChatId(otherId);
		setShowSidebar(false);
	};

	const handleSendMessage = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!messageInput.trim() || !activeChatId) return;
		setIsSending(true);
		setError("");

		const payload: MessageRequest = { content: messageInput.trim() };

		try {
			const res = await api.post(`/chat/${activeChatId}`, payload);
			const newMessage = normalizeMessage(res.data);
			// prepend ke depan karena backend sekarang DESC
			setMessages((prev) => [newMessage, ...prev]);
			setChatList((prev) => {
				const otherId = getOtherUserId(newMessage, currentUserId);
				const filtered = prev.filter((item) => getOtherUserId(item, currentUserId) !== otherId);
				return [newMessage, ...filtered];
			});
			setMessageInput("");
			// selalu scroll ke bawah setelah kirim
			scrollToBottom();
		} catch {
			setError("Failed to send message.");
		} finally {
			setIsSending(false);
		}
	};

	const formatTime = (value: string) => {
		if (!value) return "00:00";
		const timeMatch = value.match(/(\d{2}):(\d{2}):\d{2}/);
		if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`;
		let date = new Date(value);
		if (Number.isNaN(date.getTime())) date = new Date(value.replace(" ", "T"));
		if (Number.isNaN(date.getTime())) return "00:00";
		return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(e as unknown as React.SyntheticEvent<HTMLFormElement>);
		}
	};

	const chatPanelHeight = "h-[calc(100vh-180px)] md:h-[760px]";

	const sidebarJSX = (
		<div className={`bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-5 ${chatPanelHeight} flex flex-col`}>
			<div className="flex items-center justify-between border-b-4 border-black pb-4">
				<div className="flex items-center gap-2 text-black">
					<MessageSquareText className="h-6 w-6 stroke-[3px]" />
					<h2 className="text-xl font-black uppercase">Chat List</h2>
				</div>
				<span className="bg-emerald-400 border-2 border-black text-black rounded-full px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
					{chatList.length} Chats
				</span>
			</div>

			<div className="mt-4">
				<div className="relative">
					<Search className="absolute left-3 top-3.5 h-4 w-4 stroke-[3px]" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search chat"
						className="w-full bg-sky-100 border-4 border-black rounded-xl pl-10 pr-4 py-2 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
					/>
				</div>
			</div>

			<div className="mt-5 flex-1 overflow-y-auto pr-2 space-y-4">
				{isLoadingList ? (
					<div className="h-full flex items-center justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
					</div>
				) : filteredChatList.length === 0 ? (
					<div className="bg-amber-100 border-4 border-black rounded-xl p-6 text-center shadow-[4px_4px_0px_0px_#000]">
						<p className="font-bold text-black uppercase tracking-wider">
							{searchQuery ? "No results." : "No chat yet."}
						</p>
					</div>
				) : (
					filteredChatList.map((item) => {
						const otherId = getOtherUserId(item, currentUserId);
						const otherName = currentUserId
							? getOtherUserName(item, currentUserId)
							: item.sender?.name || "Unknown";
						const isActive = otherId === activeChatId;
						const isUnread = !item.is_read && item.sender_id !== currentUserId;
						const initial = otherName.charAt(0).toUpperCase() || "U";

						return (
							<button
								key={item.id}
								onClick={() => handleSelectChat(item)}
								className={`w-full text-left border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] hover:cursor-pointer ${
									isActive ? "bg-amber-300" : "bg-sky-100"
								}`}
							>
								<div className="flex items-start gap-3">
									<div className="h-12 w-12 bg-pink-500 border-4 border-black rounded-full flex items-center justify-center text-white font-black shadow-[2px_2px_0px_0px_#000]">
										{initial}
									</div>
									<div className="flex-1 overflow-hidden">
										<div className="flex items-center justify-between gap-2">
											<p className="font-black uppercase text-sm truncate text-black">{otherName}</p>
											<span className="text-xs font-black text-gray-600 shrink-0">
												{formatTime(item.created_at)}
											</span>
										</div>
										<p className="text-xs font-bold text-gray-700 mt-1 truncate">
											{item.content}
										</p>
									</div>
									{isUnread && (
										<span className="h-4 w-4 bg-red-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000] shrink-0"></span>
									)}
								</div>
							</button>
						);
					})
				)}
			</div>
		</div>
	);

	const messagePanelJSX = (
		<div className={`bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-4 md:p-6 ${chatPanelHeight} flex flex-col`}>
			<div className="flex items-center justify-between border-b-4 border-black pb-4">
				<div className="flex items-center gap-3 text-black min-w-0">
					{/* back to sidebar on mobile */}
					<button
						onClick={() => setShowSidebar(true)}
						className="md:hidden flex items-center justify-center h-10 w-10 bg-amber-400 border-4 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all shrink-0 cursor-pointer"
					>
						<ArrowLeft className="h-5 w-5 stroke-[3px]" />
					</button>
					<div className="h-10 w-10 md:h-12 md:w-12 bg-purple-400 border-4 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
						<User className="h-5 w-5 md:h-6 md:w-6 text-black stroke-[3px]" />
					</div>
					<div className="min-w-0">
						<h2 className="text-lg md:text-xl font-black uppercase truncate">{activeChatName || "Select Chat"}</h2>
						<p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
							{activeChatId ? "Active conversation" : "No chat selected"}
						</p>
					</div>
				</div>
				{activeChatId && (
					<span className="bg-sky-200 border-2 border-black text-black rounded-full px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] shrink-0">
						{onlineUsers.includes(activeChatId) ? (
							<span className="text-xs font-black text-emerald-500 flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
								Online
							</span>
						) : (
							<span className="text-xs font-bold text-gray-400">Offline</span>
						)}
					</span>
				)}
			</div>

			{/* area messages — flex-col-reverse buat terbaru di bawah */}
			<div
				ref={chatContainerRef}
				className="flex-1 overflow-y-auto pr-2 py-5 flex flex-col-reverse gap-4"
			>
				{isLoadingHistory ? (
					<div className="h-full flex items-center justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
					</div>
				) : !activeChatId ? (
					<div className="h-full flex items-center justify-center">
						<div className="bg-amber-100 border-4 border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_#000] max-w-md">
							<p className="font-black uppercase text-black">Choose a chat from the left</p>
							<p className="text-sm font-bold text-gray-700 mt-2">
								Start a conversation and manage your messages here.
							</p>
						</div>
					</div>
				) : messages.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<div className="bg-sky-100 border-4 border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_#000] max-w-md">
							<p className="font-black uppercase text-black">No messages yet</p>
							<p className="text-sm font-bold text-gray-700 mt-2">
								Say hello to start this conversation.
							</p>
						</div>
					</div>
				) : (
					<>
						{messages.map((msg) => {
							const isMine = msg.sender_id === currentUserId;
							const isRead = msg.is_read;
							return (
								<div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
									<div
										className={`min-w-[20%] max-w-[80%] md:max-w-[70%] border-4 border-black rounded-2xl p-3 md:p-4 shadow-[4px_4px_0px_0px_#000] ${
											isMine ? "bg-pink-200" : "bg-emerald-100"
										}`}
									>
										<p className="text-sm font-bold text-black whitespace-pre-wrap">{msg.content}</p>
										<div className="flex items-end justify-end gap-2 mt-2 text-xs font-black text-gray-700">
											<span>{formatTime(msg.created_at)}</span>
											{isMine && (
												isRead
													? <CheckCheck className="h-3 w-3 stroke-[3px] text-emerald-500" />
													: <CheckCheck className="h-3 w-3 stroke-[3px]" />
											)}
										</div>
									</div>
								</div>
							);
						})}
						{hasMore && (
							<div className="flex justify-center">
								<button
									onClick={handleLoadMore}
									disabled={isLoadingMore}
									className="flex items-center gap-2 bg-sky-200 border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all font-black text-black uppercase text-xs cursor-pointer disabled:opacity-60"
								>
									{isLoadingMore ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black border-t-pink-500" />
									) : (
										<ChevronUp className="h-4 w-4 stroke-[3px]" />
									)}
									{isLoadingMore ? "Loading..." : "Load older messages"}
								</button>
							</div>
						)}
					</>
				)}
			</div>

			<form onSubmit={handleSendMessage} className="border-t-4 border-black pt-4">
				<div className="flex items-end gap-3">
					<textarea
						rows={2}
						onKeyDown={handleKeyDown}
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						placeholder={activeChatId ? "Type your message..." : "Select a chat to start typing"}
						disabled={!activeChatId}
						className="flex-1 bg-white border-4 border-black rounded-2xl p-3 md:p-4 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
					/>
					<button
						type="submit"
						disabled={!activeChatId || isSending || !messageInput.trim()}
						className="flex items-center gap-2 bg-pink-500 px-4 md:px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all font-black text-white uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						<span className="hidden sm:inline">SEND</span>
						<Send className="h-5 w-5 stroke-[3px]" />
					</button>
				</div>
			</form>
		</div>
	);

	return (
		<div className="min-h-screen bg-sky-100 p-4 md:p-6 font-sans">
			<div className="max-w-6xl mx-auto">
				<button
					onClick={() => router.back()}
					className="inline-flex items-center gap-2 bg-amber-400 px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all font-black text-black uppercase text-sm w-fit mb-4 md:mb-6 cursor-pointer"
				>
					<ArrowLeft className="h-4 w-4 stroke-[3px]" />
					BACK
				</button>

				{error && (
					<div className="mb-4 bg-red-500 border-4 border-black p-4 rounded-xl text-white font-black uppercase text-center shadow-[4px_4px_0px_0px_#000]">
						{error}
					</div>
				)}

				{/* desktop: two-column layout */}
				<div className="hidden md:grid grid-cols-12 gap-6">
					<div className="col-span-4">{sidebarJSX}</div>
					<div className="col-span-8">{messagePanelJSX}</div>
				</div>

				{/* mobile: toggle between sidebar and message panel */}
				<div className="md:hidden">
					{showSidebar ? sidebarJSX : messagePanelJSX}
				</div>
			</div>
		</div>
	);
}
