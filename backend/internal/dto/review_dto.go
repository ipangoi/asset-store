package dto

type CreateReviewRequest struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

type ReviewResponse struct {
	ID      string `json:"id"`
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`

	ReviewerName string `json:"reviewer_name"`
	CreatedAt    string `json:"created_at"`
}
