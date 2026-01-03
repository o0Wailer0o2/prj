import { login, signup } from "@/lib/axios/auth";
import type {
  LoginApiRequest,
  LoginResponseDTO,
  SignupApiRequest,
  SignupResponseDTO
} from "@/lib/types/auth";
import type { MutationOptions } from "@tanstack/react-query";

export const createLoginMutationOptions = (): MutationOptions<
  LoginResponseDTO,
  Error,
  LoginApiRequest
> => {
  return {
    mutationKey: ["login"],
    mutationFn: async (data: LoginApiRequest) => {
      return await login(data);
    }
  };
};

export const createSignupMutationOptions = (): MutationOptions<
  SignupResponseDTO,
  unknown,
  SignupApiRequest
> => {
  return {
    mutationKey: ["signup"],
    mutationFn: (data: SignupApiRequest) => signup(data)
  };
};
