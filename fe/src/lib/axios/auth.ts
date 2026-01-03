import type {
  LoginApiRequest,
  LoginApiResponse,
  SignupApiRequest,
  SignupApiResponse
} from "@/lib/types/auth";
import axiosInstance from "@/lib/axios/instance";
import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

export const login = async ({ email, password }: LoginApiRequest) => {
  const response = await axiosInstance.post<LoginApiResponse>("/auth/authenticate", {
    email,
    password
  });
  return response.data.result;
};

export const signup = async ({ email, password, fullname }: SignupApiRequest) => {
  const response = await axiosInstance.post<SignupApiResponse>("/auth/signup", {
    email,
    password,
    fullname
  });
  return response.data.result;
};

export const refreshAccessToken = async () => {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) throw new Error("No refresh token");

  const response = await axios.post("/auth/refresh", { refreshToken });

  const { accessToken, refreshToken: newRefreshToken, userId } = response.data.result;

  useAuthStore.getState().set({
    accessToken,
    refreshToken: newRefreshToken,
    userId
  });

  return accessToken;
};
