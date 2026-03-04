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
    user_id: string;
    seller_name: string;
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
  thumbnail_url: string;
  asset_file_key: string;
}