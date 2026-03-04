package dto

type CreateTransactionRequest struct {
	ProductID string `json:"product_id" binding:"required,uuid"`
}

type MidtransNotificationRequest struct {
	TransactionStatus string `json:"transaction_status"`
	OrderID           string `json:"order_id"`
	FraudStatus       string `json:"fraud_status"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
}

type TransactionResponse struct {
	ID              string          `json:"id"`
	OrderID         string          `json:"order_id"`
	ProductID       string          `json:"product_id"`
	Amount          int             `json:"amount"`
	Status          string          `json:"status"`
	SnapToken       string          `json:"snap_token"`
	SnapRedirectURL string          `json:"snap_redirect_url"`
	Product         ProductResponse `json:"product"`
	IsFree          bool            `json:"is_free"`
}
