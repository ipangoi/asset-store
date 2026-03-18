export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    token?: string;
}

export interface ProductResponse {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail_url: string;
    seller_id: string;
    seller_name: string;
    category_name?: string; 
    average_rating?: number;
    total_reviews?: number;
    reviews?: ReviewResponse[];
    asset_file_size?: number;
    asset_file_type?: string;
}

export interface TransactionResponse {
    id: string;
    order_id: string;
    amount: number;
    status: string;
    snap_token: string;
    snap_redirect_url: string;
    is_free: boolean;
}

export interface CreateProductRequest {
    title: string;
    description: string;
    price: number;
    category_id: string;
    thumbnail: File; 
    asset_file: File;
}

export interface UserPublicProfileResponse {
    id: string;
    name: string;
    products: ProductResponse[]; 
}

export interface CategoryResponse {
    id: string;
    category_name: string;
}

export interface ReviewResponse {
    id: string;
    rating: number;
    comment: string;
    reviewer_name: string;
    created_at: string;
}

export interface CreateReviewRequest {
    rating: number;
    comment: string;
}

export interface MessageResponse {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender: UserResponse;
    receiver: UserResponse;
}

export interface MessageRequest {
    content: string;
}

export interface WSMessage {
    type: "CHAT" | "READ_RECEIPT";
    sender_id: string;
    receiver_id: string;
    content: string;
}