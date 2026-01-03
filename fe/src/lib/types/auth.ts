export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface LoginApiResponse {
  code: number;
  message: string;
  result: LoginResponseDTO;
}

export interface SignupApiRequest {
  email: string;
  password: string;
  fullname: string;
}

export interface SignupResponseDTO {
  placeholder: any;
}

export interface SignupApiResponse {
  code: number;
  message: string;
  result: SignupResponseDTO;
}
