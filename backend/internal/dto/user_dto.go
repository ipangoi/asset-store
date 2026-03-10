package dto

type UserResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token,omitempty"`
}

type UserRegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserUpdateRoleRequest struct {
	Role string `json:"role"`
}

type UserUpdateProfileRequest struct {
	Name string `json:"name" binding:"required"`
}

type UserPublicProfileResponse struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	Products []ProductResponse `json:"products"`
}
