import axiosInstance from "@/lib/axios/instance";
import type { BookDetails, CDDetails, DVDDetails, NewspaperDetails } from "@/lib/types/product";

// Book APIs
export const createBook = async (book: Omit<BookDetails, "productId"> & { productId?: number }) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: BookDetails;
  }>("/book/create", book);
  return response.data.result;
};

export const updateBook = async (book: BookDetails) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: BookDetails;
  }>("/book/update", book);
  return response.data.result;
};

export const getBook = async (productId: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: BookDetails;
  }>("/book/get", {
    params: { productId }
  });
  return response.data.result;
};

// CD APIs
export const createCD = async (cd: Omit<CDDetails, "productId"> & { productId?: number }) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: CDDetails;
  }>("/cd/create", cd);
  return response.data.result;
};

export const updateCD = async (cd: CDDetails) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: CDDetails;
  }>("/cd/update", cd);
  return response.data.result;
};

export const getCD = async (productId: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: CDDetails;
  }>("/cd/get", {
    params: { productId }
  });
  return response.data.result;
};

// DVD APIs
export const createDVD = async (dvd: Omit<DVDDetails, "productId"> & { productId?: number }) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: DVDDetails;
  }>("/dvd/create", dvd);
  return response.data.result;
};

export const updateDVD = async (dvd: DVDDetails) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: DVDDetails;
  }>("/dvd/update", dvd);
  return response.data.result;
};

export const getDVD = async (productId: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: DVDDetails;
  }>("/dvd/get", {
    params: { productId }
  });
  return response.data.result;
};

// Newspaper APIs
export const createNewspaper = async (
  newspaper: Omit<NewspaperDetails, "productId"> & { productId?: number }
) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: NewspaperDetails;
  }>("/newspaper/create", newspaper);
  return response.data.result;
};

export const updateNewspaper = async (newspaper: NewspaperDetails) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: NewspaperDetails;
  }>("/newspaper/update", newspaper);
  return response.data.result;
};

export const getNewspaper = async (productId: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: NewspaperDetails;
  }>("/newspaper/get", {
    params: { productId }
  });
  return response.data.result;
};
